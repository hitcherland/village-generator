function readTextFile(path) {
    const promise = new Promise(function (resolve, reject) {
        const request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.send(null);
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {
                var type = request.getResponseHeader('Content-Type');
                if (type.indexOf("text") !== 1) {
                    return resolve(request.responseText);
                }
                return reject("type was not text");
            }
        };
    });

    return promise;
}

function parsePXContent(content) {
    return new Promise(function(resolve, reject) {
        const lines = content.split(/;\r?\n?/);
        const pxObject = {};

        const values = [];
        const valueKeyRegex = /^VALUES\("([^"]+)"\)/;

        const valueCounts = [];

        lines.forEach(function(line) {
            const [key, value] = line.split(/=/);
            const valueKeyMatch = valueKeyRegex.exec(key);
            if(valueKeyMatch !== null) {
                values.push(valueKeyMatch[1]);
                valueCounts.push(value.split(',').length);
            }

            pxObject[key] = value;
        });

        const [rowName, columnName, entryName] = values;

        const valueArrays = values.map(function(value) {
            return [...pxObject[`VALUES("${value}")`].matchAll(/"([^"]+)"/g)].map(function (m) {
                return m[1];
            });
        });

        const rowValues = [...pxObject[`VALUES("${rowName}")`].matchAll(/"([^"]+)"/g)].map(function (m) {
            return m[1];
        });

        const columnValues = [...pxObject[`VALUES("${columnName}")`].matchAll(/"([^"]+)"/g)].map(function (m) {
            return m[1];
        });

        const entryValues = [...pxObject[`VALUES("${entryName}")`].matchAll(/"([^"]+)"/g)].map(function (m) {
            return m[1];
        });

        const output = {};
        output.entryLayout = entryValues;

        output[rowName] = rowValues.reduce(function (o, v) {
            o[v] = {};
            return o;
        }, {});

        output[columnName] = columnValues.reduce(function (o, v) {
            o[v] = {};
            return o;
        }, {});

        let D = [];
        let top = {};

        pxObject.DATA.split(/\s+/g).filter(function(v) {
            return v !== "";
        }).forEach(function(v, i) {
            let I = i;
            const indexes = valueCounts.map(function(v) { return v; }).reverse().map(function(count) {
                let v = I % count;
                I = Math.floor(I / count);
                return v;
            }).reverse();

            indexes.reduce(function (o, index, i) {
                if(o[index] === undefined) {
                    o[index] = [];
                }

                if(i === indexes.length - 1) {
                    o[index] = v;
                }

                return o[index];
            }, D);

            values.reduce(function (o, valueName, i) {
                const value = valueArrays[i][indexes[i]];
                if(o[value] === undefined) {
                    o[value] = {};
                }

                if(i === values.length - 1) {
                    o[value] = v;
                }

                return o[value];
            }, top);
        });

        resolve(top);
    });
}

export default function parsePXFile(filePath) {
    return readTextFile(filePath).then(parsePXContent);
}