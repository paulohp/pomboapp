var Profile = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="col-sm-6">
          <div className="well">
            <p><strong>{this.props.name}</strong></p>
          </div>
        </div>
      </div>
    );
  }
});

React.render(<Profile />, document.getElementById('profile'));