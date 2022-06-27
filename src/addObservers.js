
export const addObservers = (charts) => {

    for (let index = 0; index < charts.length; index++) {
        const chart = charts[index];

        for (let index1 = 0; index1 < charts.length; index1++) {
            const chart1 = charts[index1];

            if (index != index1)
                chart.addObserver(chart1)
        }
    }

}
