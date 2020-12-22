const getJauge = require('./getJauge')
const getCompoChartInfos = require('./getCompoChartInfos')

function setCompoObject(rows, i, j, k, l) {

    var compoTemp = getCompoChartInfos(rows,i,0);

    return {
        graphData: compoTemp,
        subtitle: rows[j][1],
        graphText: rows[k][1],
        source: rows[l][1],
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

    var jaugeDatas = getJauge(rows, 29, 0) // i+1

    var graphs = {};

    graphs.climate = getCompoChartInfos(rows,13,0)
    graphs.energy = getCompoChartInfos(rows,21,0)

    var completeResults = {
        emissions : {
            title: rows[37][0],
            intro: rows[38][1],
            graphs: []
        },
        energieFinale : {
            title: rows[58][0],
            intro: rows[59][1],
            graphs: []
        },
        energieRenouvelable : {
            title: rows[72][0],
            intro: rows[73][1],
            graphs: []
        },
        energieFacture : {
            title: rows[86][0],
            intro: rows[87][1],
            graphs: []
        },
        polluants : {
            title: rows[109][0],
            intro: rows[110][1],
            graphs: []
        }
    };

    completeResults.emissions.graphs[0]=setCompoObject(rows,39,45,46,47);
    completeResults.emissions.graphs[1]=setCompoObject(rows,50,53,54,55);
    completeResults.energieFinale.graphs[0]=setCompoObject(rows,61,67,68,69);
    completeResults.energieRenouvelable.graphs[0]=setCompoObject(rows,75,80,81,82);
    completeResults.energieFacture.graphs[0]=setCompoObject(rows,89,103,104,105);
    completeResults.polluants.graphs[0]=setCompoObject(rows,112,118,119,120);
    completeResults.polluants.graphs[1]=setCompoObject(rows,123,129,130,131);
    completeResults.polluants.graphs[2]=setCompoObject(rows,134,140,141,142);
    completeResults.polluants.graphs[3]=setCompoObject(rows,145,151,152,153);
    completeResults.polluants.graphs[4]=setCompoObject(rows,156,162,163,164);

    
    return {
        indicators: indicators,
        graphs : graphs,
        jaugeDatas: jaugeDatas,
        completeResults: completeResults
    }
}

module.exports = getSimulatorResults
