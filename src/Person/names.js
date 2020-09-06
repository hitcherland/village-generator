import readPXFile from './px.js';
import VSA50Path from './data/VSA50.px';
import VSA60Path from './data/VSA60.px';

const namePaths = [VSA50Path, VSA60Path];

const namesPromise = new Promise(function (resolve, reject) {
    const perYearData = {};

    let weightedData = [];

    function randomNameByYear(year) {
        const years = Object.keys(weightedData).sort();

        if(year === undefined) {
            const yearIndex = Math.floor(Math.random() * years.length);
            year = years[yearIndex];
        }

        let weightedNames = weightedData[year];
        if(weightedNames === undefined) {
            let effectiveYear = years[0];

            years.forEach(function (v) {
                if(v > year) {
                    effectiveYear = v;
                }
            });

            weightedNames = weightedData[effectiveYear];
        }
        const value = Math.random();

        let name = weightedNames[0][1];
        
        weightedNames.forEach(function(pair) {
            let [sum, weightedName] = pair;
            if(value > sum) {
                name = weightedName;
            }

        });

        return [name, year];
    }

    function checkIfCombined() {
        if(Object.values(isPathDone).every(function (v) { return v; })) {
            weightedData = Object.entries(perYearData).reduce(function(o, yearEntry) {
                const [year, nameEntry] = yearEntry;

                let total = Object.values(nameEntry).reduce(function(p, v) {
                    return p + parseInt(v);
                }, 0);

                let sum = 0;
                o[year] = Object.entries(nameEntry).reduce(function(p, entry) {
                    const [name, count] = entry;
                    sum += parseInt(count);
                    return p.concat([[sum / total, name]]);
                }, []);

                return o;
            }, {});

            resolve(randomNameByYear);
        }
    }

    const isPathDone = namePaths.reduce(function(o, v){ 
        o[v] = false;
        return o;
    }, {});

    namePaths.forEach(function(path) {
        readPXFile(path).then(function(data) {
            isPathDone[path] = true;

            Object.entries(data).forEach(function (nameEntry) {
                const [name, years] = nameEntry;
                Object.entries(years).forEach(function(yearEntry) {
                    const [year, entry] = yearEntry;

                    if(Object.values(entry)[0] === '".."') {
                        return;
                    }

                    if(perYearData[year] === undefined) {
                        perYearData[year] = {};
                    }

                    if(perYearData[year][name] === undefined) {
                        perYearData[year][name] = parseInt(Object.values(entry)[0]);
                    } else {
                        perYearData[year][name] += parseInt(Object.values(entry)[0]);
                    }
                });
            });

            checkIfCombined();
        });
    });
});

export default namesPromise;