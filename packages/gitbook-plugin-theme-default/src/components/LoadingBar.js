const GitBook = require('gitbook-core');
const { React } = GitBook;

/**
 * Displays a progress bar (YouTube-like) at the top of container
 * Based on https://github.com/lonelyclick/react-loading-bar/blob/master/src/Loading.jsx
 */
const LoadingBar = React.createClass({
    propTypes: {
        show:  React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            show: false
        };
    },

    getInitialState() {
        return {
            size: 0,
            disappearDelayHide: false, // when dispappear, first transition then display none
            percent: 0,
            appearDelayWidth: 0 // when appear, first display block then transition width
        };
    },

    componentWillReceiveProps(nextProps) {
        const { show } = nextProps;

        if (show) {
            this.show();
        } else {
            this.hide();
        }
    },

    shouldComponentUpdate(nextProps, nextState) {
        return true; // !shallowEqual(nextState, this.state)
    },

    show() {
        let { size, percent } = this.state;

        const appearDelayWidth = size === 0;
        percent = calculatePercent(percent);

        this.setState({
            size: ++size,
            appearDelayWidth,
            percent
        });

        if (appearDelayWidth) {
            setTimeout(() => {
                this.setState({
                    appearDelayWidth: false
                });
            });
        }
    },

    hide() {
        let { size } = this.state;

        if (--size < 0) {
            this.setState({ size: 0 });
            return;
        }

        this.setState({
            size: 0,
            disappearDelayHide: true,
            percent: 1
        });

        setTimeout(() => {
            this.setState({
                disappearDelayHide: false,
                percent: 0
            });
        }, 500);
    },

    getBarStyle() {
        const { disappearDelayHide, appearDelayWidth, percent } = this.state;

        return {
            width: appearDelayWidth ? 0 : percent * 100 + '%',
            display: disappearDelayHide || percent > 0 ? 'block' : 'none'
        };
    },

    getShadowStyle() {
        const { percent, disappearDelayHide } = this.state;

        return {
            display: disappearDelayHide || percent > 0 ? 'block' : 'none'
        };
    },

    render() {
        return (
            <div className="LoadingBar">
                <div className="LoadingBar-Bar" style={this.getBarStyle()}>
                    <div className="LoadingBar-Shadow"
                         style={this.getShadowStyle()}>
                    </div>
                </div>
            </div>
        );
    }
});

function calculatePercent(percent) {
    percent = percent || 0;

    // How much of remaining bar we advance
    const progress = 0.1 + Math.random() * 0.3;

    return percent + progress * (1 - percent);
}

module.exports = LoadingBar;
