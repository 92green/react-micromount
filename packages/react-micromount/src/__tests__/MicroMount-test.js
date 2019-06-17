// @flow
import React from 'react';
import MicroMount from '../MicroMount';

import {act} from '@testing-library/react';
import {cleanup} from '@testing-library/react';
import {render} from '@testing-library/react';
import loadJsMock from 'load-js';

afterEach(cleanup);

describe('MicroMount', () => {

    it('should request url', async () => {
        await act(async () => {
            render(<MicroMount url="http://example.com" />);
        });

        expect(loadJsMock).toHaveBeenCalledTimes(1);
        expect(loadJsMock.mock.calls[0][0]).toEqual(['http://example.com']);
    });

    it('should show fallback during loading', async () => {
        await act(async () => {
            let {getAllByText} = render(<MicroMount url="http://example.com" fallback="loading" />);
            expect(getAllByText('loading').length).toBe(1);

            console.log("loadJsMock.mock.results", loadJsMock.mock);

            await loadJsMock.mock.results;

            expect(getAllByText('loading').length).toBe(0);
        });


        //expect(loadJsMock).toHaveBeenCalledTimes(1);
        //expect(loadJsMock.mock.calls[0][0]).toEqual(['http://example.com']);
    });

});
