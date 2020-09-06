import React from 'react';
import './Map.css';

class Map extends React.Component {
    constructor(props) {
        super(props);

        const {
            width = 800,
            height = 600,
        } = props;

        this.state = {
            width,
            height
        };

        this.canvas = React.createRef();
    }

    componentDidMount() {
        if(this.canvas.current !== undefined) {
            this.canvas.current.width = this.state.width;
            this.canvas.current.height = this.state.height;
        }
    }

    render() {
        return (<canvas className="map" ref={this.canvas}></canvas>);
    }
}

export default Map;