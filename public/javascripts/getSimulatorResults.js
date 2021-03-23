const getJauge = require('./getJauge')
const getTable = require('./getTable')
const getCompoChartInfos = require('./getCompoChartInfos')

function setCompoObject(rows, i, j) {

    var compoTemp = getCompoChartInfos(rows,i,0);

    return {
        graphData: compoTemp,
        subtitle: rows[j][1],
        graphText: rows[j+1][1],
        source: rows[j+2][1],
        graphType: "CompoChart",
        title: compoTemp.data.title,
        legendData: compoTemp.graphDatas
    }

}

function getSimulatorResults(rows) {

    //indicateurs
    let i=2;
    let indicator={};
    let indicators = {};

    while (rows[i] && rows[i].length!==0) {
        let type = rows[i][4]; 
        indicator = {
            name: rows[i][1],
            value: rows[i][2],
            unit: rows[i][3],
            infos: rows[i][5],
            impactGnl: rows[i][6],
            impactLcl: rows[i][7],
        }

        if (!indicators[rows[i][0]]) {
            indicators[rows[i][0]]={}
        }
        
        if (indicators[rows[i][0]][type]) {
            indicators[rows[i][0]][type].push(indicator)
        }
        else {
            indicators[rows[i][0]][type]=[indicator];
        }
        i++
    }

    var jaugeDatas = getJauge(rows, 70, 0) // i+1

    var graphs = {};

    graphs.climate = getCompoChartInfos(rows,50,0)
    graphs.energy = getCompoChartInfos(rows,60,0)

    let aggregator = {};
    aggregator.impactGnlTable = getTable(rows, 17);
    aggregator.sectorsDetailTable = getTable(rows, 25);


    var completeResults = {
        emissions : {
            title: rows[79][0],
            intro: rows[80][1],
            graphs: [
                setCompoObject(rows,81,89),
                setCompoObject(rows,94,97)
            ]
        },
        energieFinale : {
            title: rows[102][0],
            intro: rows[103][1],
            graphs: [
                setCompoObject(rows,105,112)
            ]
        },
        energieRenouvelable : {
            title: rows[117][0],
            intro: rows[118][1],
            graphs: [setCompoObject(rows,120,128)]
        },
        energieFacture : {
            title: rows[134][0],
            intro: rows[135][1],
            graphs: [
                setCompoObject(rows,137,154)
            ]
        },
        polluants : {
            title: rows[160][0],
            intro: rows[161][1],
            graphs: [
                setCompoObject(rows,163,170),
                setCompoObject(rows,175,182),
                setCompoObject(rows,187,194),
                setCompoObject(rows,199,206),
                setCompoObject(rows,211,218)
            ]
        }
    };
    
    return {
        indicators: indicators,
        graphs : graphs,
        jaugeDatas: jaugeDatas,
        aggregator: aggregator,
        completeResults: completeResults
    }
}

module.exports = getSimulatorResults
