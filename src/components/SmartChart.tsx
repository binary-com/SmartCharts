import React from 'react';
import { useStores, getContext, initContext } from 'src/store';
import { TChartProps } from 'src/types';
import Chart from './Chart';

const SmartChart = React.forwardRef(({ children, ...props }: TChartProps, ref) => {
    const is_context_intialized = React.useRef(false);
    if (!is_context_intialized.current) {
        initContext();
        is_context_intialized.current = true;
    }

    const store = useStores();
    const context = getContext();

    const Provider = context.Provider;

    return (
        <Provider value={store}>
            <Chart {...props} ref={ref}>
                {children}
            </Chart>
        </Provider>
    );
});

export default SmartChart;
