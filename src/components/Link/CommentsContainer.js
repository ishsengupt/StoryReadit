import React from "react";
import ReactDOM from "react-dom";
import Comments from "./Comments";

class CommentsContainer extends React.Component {
  render() {
    let rootComments = this.props.comments
      .filter(c => c.parentId === this.props.rootId)
      .map((c, index) => (
        <Comments
          key={index}
          handleNestedComment={this.props.handleNestedComment}
          highlightComments={this.props.highlightComments}
          highlight={this.props.highlight}
          comments={this.props.comments}
          parentComment={c}
        />
      ));

    return <div>{rootComments}</div>;
  }
}

export default CommentsContainer;
