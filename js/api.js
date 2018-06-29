if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('./service-worker.js', { scope: './' })
    .then(registration => {
      console.log("Service Worker Registered");
    })
    .catch(err => {
      console.log("Service Worker Failed to Register", err);
    })

}


const el = e => document.querySelector(e);
const insertHTML = (e) => {

}

fetch('https://free.currencyconverterapi.com/api/v5/countries')
.then(response => response.json())
.then(json_files => {
 
 let myViews = '';
        for (let country of Object.values(json_files.results)) {
     
            myViews += `<option id="${country.currencySymbol}" value="${country.currencyId}">${country.currencyName}</option>`;
        }
        el("#convert_from").insertAdjacentHTML('afterbegin', myViews);
        el("#convert_to").insertAdjacentHTML('afterbegin', myViews);

});

let from_value = "" ;
let symbol = "" ;
// on select it calls
send_From_Value = () => {


from_value = document.getElementById("convert_from").value ;

}

let to_value = "";
send_To_Value = (s) => {
  symbol = (s[s.selectedIndex].id);
  to_value = document.getElementById("convert_to").value ;

  
  }


convert =() => {
    if (!navigator.onLine) {
        alert ("You are currency offline, Please Check your internet connection and retry");
        } 
        else {
    input = document.getElementById("amount").value ;
    if (input == '' ){
        alert("Please Enter an Amount.");
    }
    
    else{
        fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=${from_value}_${to_value}&compact=ultra`)
        .then(response => response.json())
        .then(json_unit => {
           
            let ddl = document.getElementById("convert_from");
            let selectedValue = ddl.options[0].value;
        let unit = json_unit[`${from_value}_${to_value}`] ;
        let amount = document.getElementById("amount").value;
        converted_value = unit * amount ;
        // alert(isNaN(converted_value));
        if(isNaN(converted_value) || selectedValue === "-Select-a-Country" ){
           
            alert ("Select the Country From and To, to see correct conversion")
        }
        else {
         
            document.getElementById("converted_result").innerHTML = (` ${symbol} ${Math.round(converted_value)}`); 
            
            document.getElementById("show_unit").innerHTML = (`${unit}`);
        }
        
          
        });
        }
    }

}
// IndexedDb initialization
 
const dbPromise =  idb.open('currencyConverter', 3, (upgradeDb) => {
    switch (upgradeDb.oldVersion) {
        case 0:
            upgradeDb.createObjectStore('countries', { keyPath: 'currencyId' });
        case 1:
            let countriesStore = upgradeDb.transaction.objectStore('countries');
            countriesStore.createIndex('country', 'currencyName');
            countriesStore.createIndex('country-code', 'currencyId');
        case 2:
            upgradeDb.createObjectStore('conversionRates', { keyPath: 'query' });
            let ratesStore = upgradeDb.transaction.objectStore('conversionRates');
            ratesStore.createIndex('rates', 'query');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    /*
     Fetch Countries Process
      */
    fetch('https://free.currencyconverterapi.com/api/v5/countries')
        .then(res => res.json())
        .then(res => {
                Object.values(res.results).forEach(country => {
                    dbPromise.then(db => {
                        const countries = db.transaction('countries', 'readwrite').objectStore('countries');
                        countries.put(country);
                    })
                });
                dbPromise.then(db => {
                    const countries = db.transaction('countries', 'readwrite').objectStore('countries');
                    const countriesIndex = countries.index('country');
                    countriesIndex.getAll().then(currencies => {
                        // fetchCountries(currencies);
                    })
                })
            }
        ).catch(() => {
        dbPromise.then(db => {
            const countries = db.transaction('countries').objectStore('countries');
            const countriesIndex = countries.index('country');
            countriesIndex.getAll().then(currencies => {
                // fetchCountries(currencies);
            })

        });
    });


});
