import React from "react";
import ReactDOM from "react-dom";
import Comment from "./Comment";

class Comments extends React.Component {
  render() {
    let comments = this.props.comments.filter(
      c => c.parentId === this.props.parentComment.created
    );

    let parentComment = this.props.parentComment;

    let childrenComments = comments.map(c => {
      return (
        <Comments
          handleNestedComment={this.props.handleNestedComment}
          highlightComments={this.props.highlightComments}
          highlight={this.props.highlight}
          key={c.id}
          parentComment={c}
          comments={this.props.comments}
        />
      );
    });

    if (childrenComments.length === 0) {
      return (
        <div>
          <Comment
            handleNestedComment={this.props.handleNestedComment}
            highlight={this.props.highlight}
            highlightComments={this.props.highlightComments}
            comment={parentComment}
          />
        </div>
      );
    } else {
      return (
        <div>
          <Comment
            handleNestedComment={this.props.handleNestedComment}
            highlight={this.props.highlight}
            highlightComments={this.props.highlightComments}
            comment={parentComment}
          />
          <div style={{ marginLeft: "40px" }}>{childrenComments}</div>
        </div>
      );
    }
  }
}

export default Comments;
