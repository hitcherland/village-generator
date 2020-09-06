import CNA21Path from './data/CNA21.px';
import parsePXFile from './px.js';

const maritalStatusPromise = parsePXFile(CNA21Path);

function getBreakdownByYear(data, year) {
    if(year === undefined) {
        year = new Date().getFullYear();
    }

    const years = [...new Set(Object.values(data).reduce(function(o, yearData) {
        const years = Object.keys(yearData);

        return o.concat(years);
    }, []))].sort();

    let effectiveYear = years[0];

    years.forEach(function(y) {
        if(year > y) {
            effectiveYear = y;
        }
    });

    const breakdown = Object.entries(data).reduce(function(o, ageData) {
        const [ageGroup, years] = ageData;
        o[ageGroup] = years[effectiveYear];
        return o;
    }, {});

    return breakdown;
}

function generateRandomPerson(data, year) {
    if(year === undefined) {
        year = new Date().getFullYear();
    }

    const breakdown = getBreakdownByYear(data, year);

    let ageGroup;
    const ageGroups = Object.keys(breakdown).filter(function(key) {
        if(key === "85 years and over") {
            return true;
        } else if(key.match(/and over/)) {
            return false;
        } else if(key === "All ages") {
            return false;
        } else if(key === "0 - 14 years") {
            return false;
        } else if(key === "15 - 24 years") {
            return false;
        } else if(key === "25 - 44 years") {
            return false;
        } else if(key === "45 - 64 years") {
            return false;
        }
        return true;
    });

    let total = Object.values(breakdown['All ages']).reduce(function(o, v) {
        return o + parseInt(v['Both sexes']['All marital status']);
    }, 0);

    let age;
    ageGroup = ageGroups[0];
    let goal = Math.random();
    let sum = 0;

    let ddd = [];
    ageGroups.forEach(function(group) {
        let count = Object.values(breakdown[group]).reduce(function(o, v) {
            return o + parseInt(v['Both sexes']['All marital status']);
        }, 0);

        ddd.push([group, count]);

        count /= total;

        if(sum < goal) {
            ageGroup = group;
        }
        sum += count;
    });

    if(ageGroup === "85 years and over") {
        age = 85 + Math.floor(25 * Math.random());
    } else {
        const match  = /(\d+) - (\d+) years/.exec(ageGroup);
        const minAge = parseInt(match[1]);
        const maxAge = parseInt(match[2]);

        age = minAge + Math.floor(Math.random() * (maxAge - minAge));
    }

    const breakdown1 = breakdown[ageGroup];
    let loc;
    total = Object.values(breakdown1).reduce(function(o, v) {
        return o + parseInt(v['Both sexes']['All marital status']);
    }, 0);

    goal = Math.random();
    sum = 0;
    Object.entries(breakdown1).forEach(function(entry) {
        const [key, value] = entry;
        const count = parseInt(value['Both sexes']['All marital status']) / total;

        if(sum < goal) {
            loc = key;
        }
        sum += count;
    });

    let location;
    if(loc.match(/Rural/)) {
        location = "rural";
    } else {
        location = "urban";
    }

    const breakdown2 = breakdown1[loc]['Both sexes'];

    let maritalStatus;
    total = parseInt(breakdown2['All marital status']);

    goal = Math.random();
    sum = 0;
    Object.entries(breakdown2).filter(function(entry) {
        const key = entry[0];
        return key !== 'All marital status';
    }).forEach(function(entry) {
        const [key, value] = entry;
        const count = parseInt(value) / total;

        if(sum < goal) {
            maritalStatus = key.toLowerCase();
        }
        sum += count;
    });

    return {
        age,
        location,
        maritalStatus
    };

}

const exportPromise = new Promise(function(resolve, reject) {
    maritalStatusPromise.then(function (data) {
        resolve(function(year) {
            return generateRandomPerson(data, year);
        });
    });
});

export default exportPromise;