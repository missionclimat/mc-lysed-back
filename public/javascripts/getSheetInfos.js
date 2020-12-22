const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const getSimulatorResults = require('./getSimulatorResults')
require("dotenv").config();

/////////////////////////////////////////////////////////////////////////////////////////////////
/// THIS MODULE AIM TO CONVERT THE MASTER SPREADSHEET IN A JSON USED FOR SIMULATOR INITIAL RENDER
/////////////////////////////////////////////////////////////////////////////////////////////////

///////////////
/////PARAMETERS
///////////////

//const idSpreadsheetData = "12Wfg2QfNVEztCCdjICr7_K3OOKvUthk9J77UEUf-du8" (former one)



async function getSheetInfos() {


  const idSpreadsheetData = "1bs5NC1uJkO-X-n4N0LFAHgGgAUGuc0uu1C2WmqdkN58"
  var categoryRange = 'Secteurs!A3:I7'
  var parametersRange = 'Paramètres!A3:V26'
  var resultsRange = 'Résultats!A1:BB300'
  
  
  function getCategoryInfo(data) {
  
      var category = {}
  
      var cat = {
          index: data[0], 
          name: data[2],
          scope: data[1], 
          description: data[3],
          color: data[7],
          colorHover: data[8]
      }
  
      category.data=cat
  
      category.resultats={}
      category.resultats.v15 = data[4]
      category.resultats.vScenario = data[5]
      category.resultats.vBaU = data[6]
  
      return category
  }
  
  function copyCategoryInfo(catName, categoriesInfo) {
    var catFinal = {}
    categoriesInfo.forEach(cat => {
      if (cat.data.name === catName) {
        catFinal = cat
      }
    });
  
    return catFinal
  
  }
  
  function formatNumber(dat, isPercent) {
    
    //cas ou dat est un nombre
    if (!isNaN(Number(dat.replace(",",".")))) {
      var numberFormated = Number(dat.replace(",", "."))
      isPercent == 1 ? numberFormated *= 100 : "kikou"
      return numberFormated
    }
    else {
      return dat
    }
    
  }
  
  function getParametersInfo(data) {
  
      var parameters = {}
  
      var isPercent = 0;
      data[4] === "%" ? isPercent=1 : isPercent=0
  
      var param = {
        index: Number(data[0]), 
        name: data[4],
        unit: data[5],
        description: data[6],
        expert: formatNumber(data[8],0),
        value: formatNumber(data[9], data[5]==="%"),
        possibleValues: data[10],
        step: formatNumber(data[11], data[5]==="%"),
        min: formatNumber(data[12], data[5]==="%"),
        max: formatNumber(data[13], data[5]==="%"),
        v15: formatNumber(data[14], data[5]==="%"),
        vBaU: formatNumber(data[15], data[5]==="%"),
        infoCalcul: data[16],
        tendance: data[17],
        contraintes: data[18],
        coBenefices: data[19],
        coInconveniants: data[20],
        sources: data[21],
      }
  
      parameters.type = {}
  
      if (data[7] == "slider") {
          parameters.type.slider=1;
          parameters.type.list=0;
      }
      else if (data[7] == "list") {
          parameters.type.slider=0;
          parameters.type.list=1;
      }
  
      parameters.data=param
  
      return parameters
  
  }
  
  function getUrl(parameters) {
  
    var url = process.env.FRONTEND_URI + "/simulator/favorites/" ;
  
    for (let i=0; i<parameters.length;i++) {
      
      var param = parameters[i]
      url += "p" + i + "="
  
      if (param.type === "slider") {
        url += param.value
      }
      else if (param.type === "list") {
        var possibleValues= param.possibleValues.split(", ")
        url += possibleValues.indexOf(param.value)
      }
  
      i < parameters.length-1 ? url += "&&" : "kikou"
      
    }
  
    return url
  
  }





  const auth = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/spreadsheets"] });

  const sheets = google.sheets({version: 'v4', auth});

  //GET SHEET DATA // NAV
  await sheets.spreadsheets.values.get({
      spreadsheetId: idSpreadsheetData,
      range: categoryRange,
    }, (err, res) => {
      
      if (err) return console.log('The API returned an error: ' + err);
      var rows = res.data.values;
      var iLine=0;
      var iNav=0;
      var iCat=0
      var nav=[{scope: rows[0][1], categories: [] }];
      var categoriesInfo=[]

      //loop on the Secteurs sheet lines
      while (rows[iLine]) {

        categoriesInfo.push(getCategoryInfo(rows[iLine]))
        //same scope : add the category to the scope
        if (rows[iLine][1]== nav[iNav].scope) {
          nav[iNav].categories.push({name: rows[iLine][2], id:"cat"+iCat, color: rows[iLine][7], colorHover: rows[iLine][8]})
        }

        //different scope : create scope and add the category to it
        else {
          nav.push({scope: rows[iLine][1], categories: [{name:[rows[iLine][2]], id:"cat"+iCat, color: rows[iLine][7], colorHover: rows[iLine][8] }]})
          iNav++
        }
        iLine++
        iCat++
      }

    //PARAMS
    sheets.spreadsheets.values.get({
      spreadsheetId: idSpreadsheetData,
      range: parametersRange,
    }, (err, res) => {
      
      if (err) return console.log('The API returned an error: ' + err);
      rows = res.data.values;

      //v1.5 et vBaU, pour initialisation
      var options = {vInit: [], vMin: [], v15: [], vBaU: [], vMax: [], unit:[]};

      options.unit.push(rows[0][5])
      options.vInit.push([formatNumber(rows[0][9], rows[0][5]==="%")])
      options.vMin.push([formatNumber(rows[0][12], rows[0][5]==="%")])
      options.vMax.push([formatNumber(rows[0][13], rows[0][5]==="%")])
      options.v15.push([formatNumber(rows[0][14], rows[0][5]==="%")])
      options.vBaU.push([formatNumber(rows[0][15], rows[0][5]==="%")])

      var parameters = []
      parameters.push({
        type: rows[0][7],
        value: formatNumber(rows[0][9], rows[0][5]==="%"),
        possibleValues: rows[0][10]
      })

      //////////////////

      var categories=[{...copyCategoryInfo(rows[0][3], categoriesInfo), parameters: [getParametersInfo(rows[0])]}];

      var iLine=1;
      var iCat=0;

      var isPercent = 0;
      
      while (rows[iLine]) {

        //même categorie
        if (rows[iLine][3] == categories[iCat].data.name) {
          categories[iCat].parameters.push(getParametersInfo(rows[iLine]))
        }

        //nouvelle catégorie
        else {
          categories.push({...copyCategoryInfo(rows[iLine][3], categoriesInfo), parameters: [getParametersInfo(rows[iLine])]})
          iCat++
        }

        rows[iLine][5] === "%" ? isPercent = 1 : isPercent = 0

        options.unit.push(rows[iLine][5])
        options.vInit.push([formatNumber(rows[iLine][9], isPercent)])
        options.vMin.push([formatNumber(rows[iLine][12], isPercent)])
        options.vMax.push([formatNumber(rows[iLine][13], isPercent)])
        options.v15.push([formatNumber(rows[iLine][14], isPercent)])
        options.vBaU.push([formatNumber(rows[iLine][15], isPercent)])

        //utile principalement pour transcrire l'url avec params en values format MISSION1.5 / (pour les chaines de caractères)
        parameters.push({
          type: rows[iLine][7],
          value: formatNumber(rows[iLine][9], isPercent),
          possibleValues: rows[iLine][10]
        })
        
        iLine++
      }

      const url = getUrl(parameters)

      //DONNEES SORTIES
      sheets.spreadsheets.values.get({
        spreadsheetId: idSpreadsheetData,
        range: resultsRange,
      }, (err, res) => {

        rows =[]
        rows = res.data.values;

        var results = getSimulatorResults(rows)
        results.url=url
        
        var initialDatas = {
            nav: nav, 
            categories: categories, 
            parameters: parameters,
            options: options,
            results: results
        }
        console.log(initialDatas)
        return JSON.stringify(initialDatas)

      });

    });

  });

}


module.exports = getSheetInfos