import React from 'react';
import generateRandomPersonPromise from './population.js';
import randomNameByYearPromise from './names.js';
import Profile from './Profile.js';
import './Person.css';
import hsluv from 'hsluv';

let year = parseInt(new Date().getFullYear());

function generateStat(dropLowest=2, dropHighest=2) {
    const rolls = Array.from(new Array(dropLowest + dropHighest + 3)).map(function() {
        return Math.ceil(6 * Math.random());
    }).sort();

    return rolls.slice(dropLowest, dropLowest + 3).reduce(function(o, v) {
        return o + v;
    }, 0);
}
const statNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
function generateStats(dropLowest=3, dropHighest=3) {
    return statNames.reduce(function(o, v) {
        o[v] = generateStat(dropLowest, dropHighest);
        return o;
    }, {});
}

function pickDateOfBirth(year) {
    const date = new Date();

    const isCurrentYear = parseInt(year) === parseInt(date.getFullYear());
    let month;
    if(isCurrentYear) {
        month = Math.ceil(date.getMonth() * Math.random());
    } else {
        month = Math.ceil(Math.random() * 12);
    }

    const isCurrentMonth = month === parseInt(date.getMonth());
    let day;
    if(isCurrentYear && isCurrentMonth) {
        day = Math.ceil(Math.random() * date.getDate());
    } else {
        const cycle = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if(month === 2) {
            if(year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) {
                cycle[1] = 29;
            }
        }

        day = Math.ceil(cycle[month - 1] * Math.random());
    }

    return [day, month, year];
}


class Person extends React.Component {
    constructor(props) {
        super(props);

        const {
            name,
            dateOfBirth = [],
            maritalStatus,
            location,
            tags = [],
            stats = generateStats(),
            backgroundHSL=[
                Math.floor(Math.random() * 360),
                100,
                75,
            ],
            skinHSL = [
                34,
                72,
                Math.floor(Math.random() * 80 + 10),
            ],
            hairHSL = [
                Math.floor(Math.random() * 360),
                Math.floor(Math.random() * 50 + 50),
                Math.floor(Math.random() * 20 + 10),
            ],
            clothingHSL = [
                Math.floor(Math.random() * 360),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
            ],
            clothing,
            hair,
            backHair,
        } = props;

        this.state = {
            name,
            tags,
            stats,
            dateOfBirth,
            location,
            maritalStatus,
            backgroundHSL,
            skinHSL,
            hairHSL,
            clothingHSL,
            clothing,
            hair,
            backHair,
        };

        this._isMounted = false;

        if(name === undefined) {
            Person.generate().then(function(data) {
                this.setState(data);
            }.bind(this));
        }

        this.canvas = React.createRef();
    }

    componentDidMount() {
        this._isMounted = true;
    }

    render() {
        const skinHSL = this.state.skinHSL;

        const bgColor = hsluv.hsluvToHex(this.state.backgroundHSL);
        const faceColor = hsluv.hsluvToHex([skinHSL[0], skinHSL[1], skinHSL[2] - 5]);
        const skinColor = hsluv.hsluvToHex(skinHSL);
        const clothingColor = hsluv.hsluvToHex(this.state.clothingHSL);
        const hairColor = hsluv.hsluvToHex(this.state.hairHSL);

        const statTable = statNames.map(function(name) {

            const value = this.state.stats[name];
            let valueClass = "value";
            if(value <= 6) {
                valueClass += " very low";
            } else if(value <= 8) {
                valueClass += " low";
            } else if(value >= 14) {
                valueClass += " very high";
            } else if(value >= 12) {
                valueClass += " high";
            }
            return (<div key={name} className={`stat ${name}`}>
                <div className="name">{name}</div>
                <div className={valueClass}>{value}</div>
            </div>);
        }.bind(this));

        return (<div className="person" style={this.props.style || {}}>
            <Profile
                backgroundColor={bgColor}
                bodyColor={skinColor}
                faceColor={faceColor}
                clothingColor={clothingColor}
                hairColor={hairColor}
                clothing={this.state.clothing}
                backHair={this.state.backHair}
                hair={this.state.hair}
                ></Profile>
            <h1 className="name">{this.state.name}</h1>
            <div className="dob">{this.state.dateOfBirth.join(".")} ({year - parseInt(this.state.dateOfBirth[2])} years old)</div>
            <div className="marital-status">{this.state.maritalStatus}</div>
            <div className="location">{this.state.location}</div>
            <div className="stats">
                {statTable}
            </div>
        </div>);
    }
}

Person.generate = function(year) {
    if(year === undefined) {
        year = parseInt(new Date().getFullYear());
    }

    return new Promise(function(resolve, reject) {
        const personData = {
            name: undefined,
            dateOfBirth: undefined,
            maritalstatus: undefined,
            location: undefined,
            stats: generateStats(),
            backgroundHSL: [
                Math.floor(Math.random() * 360),
                100,
                75,
            ],
            skinHSL: [
                34,
                72,
                Math.floor(Math.random() * 80 + 10),
            ],
            hairHSL: [
                Math.floor(Math.random() * 360),
                Math.floor(Math.random() * 50 + 50),
                Math.floor(Math.random() * 20 + 10),
            ],
            clothingHSL: [
                Math.floor(Math.random() * 360),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
            ],
            ...Profile.generate(),
        };

        generateRandomPersonPromise.then(function(func) {
            const person = func(year);
            const dob = pickDateOfBirth(parseInt(year) - parseInt(person.age))

            personData.dateOfBirth = dob;
            personData.maritalStatus = person.maritalStatus;
            personData.location = person.location;

            randomNameByYearPromise.then(function(randomNameByYear) {
                const name = randomNameByYear(dob[2])[0];
                personData.name = name;
                resolve(personData);
            });
        });
    });
}

export default Person;