import React from "react";

export default class PageNotFound extends React.Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }

    render() {
        return (
            <div>
                <h4>Error 404 - Page not Found</h4>
            </div>
        );
    }
}

