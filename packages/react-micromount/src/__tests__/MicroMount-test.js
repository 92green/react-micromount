// @flow
import React from 'react';
import MicroMount from '../MicroMount';

import {act} from '@testing-library/react';
import {cleanup} from '@testing-library/react';
import {render} from '@testing-library/react';
import loadJsMock from 'load-js';

afterEach(() => {
    cleanup();

    // delete globals
    delete window["reactMicromountChain"];
    delete window["reactMicromounts"];
    delete window["reactMicromountMap"];

    loadJsMock.mockReset();
});

describe('MicroMount', () => {

    it('should request url', async () => {

        await act(async () => {
            render(<MicroMount url="http://example.com" />);
        });

        expect(loadJsMock).toHaveBeenCalledTimes(1);
        expect(loadJsMock.mock.calls[0][0]).toEqual(['http://example.com']);
    });

    it('should call mountable.mount on success', async () => {

        let mountable = {
            mount: jest.fn(),
            unmount: jest.fn()
        };

        loadJsMock
            .mockImplementation(() => {
                // simulate load-js loading a react-micromount mountable
                window["reactMicromounts"] = [mountable];
                return Promise.resolve();
            });


        await act(async () => {
            render(<MicroMount url="http://example.com" foo="bar" />);

        });

        // mount should be called
        expect(mountable.mount).toHaveBeenCalledTimes(1);
        // container should be passed as 1st arg
        expect(mountable.mount.mock.calls[0][0].dataset.testid).toBe('micromount-container');
        // additional props should be passed as 2nd arg
        expect(mountable.mount.mock.calls[0][1]).toEqual({foo: "bar"});
    });

    it('should call mountable.mount on success twice without failure, coping with load-js cache hit', async () => {

        let mountable = {
            mount: jest.fn(),
            unmount: jest.fn()
        };

        loadJsMock
            .mockImplementationOnce(() => {
                // simulate load-js loading a react-micromount mountable
                window["reactMicromounts"] = [mountable];
                return Promise.resolve();
            })
            .mockImplementationOnce(() => {
                // simulate load-js cache hit
                return Promise.resolve();
            });

        await act(async () => {
            render(<MicroMount url="http://example.com" foo="bar" />);
        });

        // mount should be called
        expect(mountable.mount).toHaveBeenCalledTimes(1);
        // container should be passed as 1st arg
        expect(mountable.mount.mock.calls[0][0].dataset.testid).toBe('micromount-container');
        // additional props should be passed as 2nd arg
        expect(mountable.mount.mock.calls[0][1]).toEqual({foo: "bar"});

        await act(async () => {
            render(<MicroMount url="http://example.com" foo="bar" />);
        });

        // mount should be called again
        expect(mountable.mount).toHaveBeenCalledTimes(2);
        // container should be passed as 1st arg
        expect(mountable.mount.mock.calls[1][0].dataset.testid).toBe('micromount-container');
        // additional props should be passed as 2nd arg
        expect(mountable.mount.mock.calls[1][1]).toEqual({foo: "bar"});
    });

    it('should call mountable.unmount on unmount', async () => {

        let mountable = {
            mount: jest.fn(),
            unmount: jest.fn()
        };

        loadJsMock
            .mockImplementation(() => {
                // simulate load-js loading a react-micromount mountable
                window["reactMicromounts"] = [mountable];
                return Promise.resolve();
            });

        let unmount;

        await act(async () => {
            unmount = render(<MicroMount url="http://example.com" foo="bar" />).unmount;
        });

        await act(async () => {
            unmount();
        });

        // mount should be called
        expect(mountable.unmount).toHaveBeenCalledTimes(1);
        // container should be passed as 1st arg
        expect(mountable.unmount.mock.calls[0][0].dataset.testid).toBe('micromount-container');
    });

    it('should not try to set state when promises resolve after unmount', async () => {

        let resolvePromise = () => {};

        let promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });

        let mountable = {
            mount: jest.fn(),
            unmount: jest.fn()
        };

        loadJsMock
            .mockImplementation(() => {
                // simulate load-js loading a react-micromount mountable
                window["reactMicromounts"] = [mountable];
                return promise; // non-resolving promise
            });

        let unmount;

        await act(async () => {
            unmount = render(<MicroMount url="http://example.com" foo="bar" />).unmount;
        });

        await act(async () => {
            unmount();
        });

        await resolvePromise();

        expect(true).toBe(true); // this test just needs to pass without error
    });

    it('should show fallback during loading', async () => {
        await act(async () => {

            let {getByTestId, rerender} = render(<MicroMount url="http://example.com" fallback={<div data-testid='loading'>loading</div>} />);
            expect(() => getByTestId('loading')).not.toThrow(); // loading should exist

            await window["reactMicromountChain"];

            rerender(<MicroMount url="http://example.com" fallback={<div data-testid='loading'>loading</div>} />);
            expect(() => getByTestId('loading')).toThrow(); // loading should not exist
        });
    });

});
