function getTable(rows, i) {


    const titles=rows[i];
    i++

    let data=[]
    while (rows[i] && rows[i][0]) {
        data.push(rows[i])
        i++
    }




    return {"titles": titles, "data":data}

  
  }

  module.exports = getTable

  