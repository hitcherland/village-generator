import React from 'react';
import './App.css';

//import Map from './Map/Map.js';
import Person from './Person/Person.js';

function compareString(a, b) {
  return a.localeCompare(b);
}

function compareDateOfBirth(a, b) {
  const A = a.slice().reverse();
  const B = b.slice().reverse();

  if(A < B) {
    return -1;
  } else if(A > B) {
    return 1;
  } else {
    return 0;
  }
}

function compareNumber(a, b) {
  if(a < b) {
    return -1;
  } else if(a > b) {
    return 1;
  } else {
    return 0;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    Array.from(new Array(50)).forEach(function(_, i) {
      const data = {
        timestamp: performance.now()
      };
      Person.generate().then(function(d) {
        Object.keys(d).forEach(function(key) {
          data[key] = d[key];
        });

        this.setState({
          people: this.state.people.concat([data]).sort()
        });

      }.bind(this));
    }.bind(this));

    this.state = {
      people: [],
      sortKey: undefined,
      sortReversed: false,
    };
  }


  handleSort(key) {
    function sorter(key, func) {
      function output() {
        const people = this.state.people.map(function(v) {
          return Object.assign({}, v, {timestamp: performance.now()});
        }).sort(function(a, b) {
          let A;
          let B;
          const keyMatch = /^stat:(.*)/.exec(key);
          if(keyMatch !== null) {
            A = a.stats[keyMatch[1]];
            B = b.stats[keyMatch[1]];
          } else {
            A = a[key];
            B = b[key];
          }

          if(this.state.sortKey === key && !this.state.sortReversed) {
            return func(B, A);
          } else {
            return func(A, B);
          }
        }.bind(this));

        this.setState({
          sortKey: key,
          people,
          sortReversed: this.state.sortKey === key && !this.state.sortReversed,
        });
      }

      output.bind(this);
      return output;
    }
    
    sorter.bind(this);

    switch(key) {
      case "name":
        return sorter("name", compareString).bind(this);
      case "age":
        return sorter("dateOfBirth", compareDateOfBirth).bind(this);
      case "marital status":
        return sorter("maritalStatus", compareString).bind(this);
      case "location":
        return sorter("location", compareString).bind(this);
      case "STR": return sorter("stat:STR", compareNumber).bind(this);
      case "DEX": return sorter("stat:DEX", compareNumber).bind(this);
      case "CON": return sorter("stat:CON", compareNumber).bind(this);
      case "INT": return sorter("stat:INT", compareNumber).bind(this);
      case "WIS": return sorter("stat:WIS", compareNumber).bind(this);
      case "CHA": return sorter("stat:CHA", compareNumber).bind(this);
      default:
        break;
    }
  }

  render() {
    let people = this.state.people.slice().map(function(data, i) {
      return (<Person {...data} key={`${i}_${data.timestamp}`} style={{order: i}}></Person>);
    });

    return (
      <div className="App">
        <h1>People of the Village</h1>
        <div>
          <span>Sort: </span>
          <button onClick={this.handleSort("name")}>name</button>
          <button onClick={this.handleSort("age")}>age</button>
          <button onClick={this.handleSort("marital status")}>marital status</button>
          <button onClick={this.handleSort("location")}>location</button>
          <button onClick={this.handleSort("STR")}>STR</button>
          <button onClick={this.handleSort("DEX")}>DEX</button>
          <button onClick={this.handleSort("CON")}>CON</button>
          <button onClick={this.handleSort("INT")}>INT</button>
          <button onClick={this.handleSort("WIS")}>WIS</button>
          <button onClick={this.handleSort("CHA")}>CHA</button>
        </div>
        <div className="people">
          {people}
        </div>
      </div>
    );
  }
}

export default App;
