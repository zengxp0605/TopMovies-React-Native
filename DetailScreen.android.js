'use strict';

var React = require('react-native');

var {
  View,
  Text,
  StyleSheet,
  ToolbarAndroid,
  WebView,
} = React;

var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'https://www.baidu.com';

var DetailScreen = React.createClass({
   getInitialState() {
    return {
      status: 'No Page Loaded',
      loading: true,
      scalesPageToFit: true,
    };
  },
  goBack(){
    console.info('go back');
    this.props.navigator.jumpBack();
  },
  render(){
    let movie = this.props.movie;
    let url = movie.detail_url ? movie.detail_url : DEFAULT_URL; 
    return (
      <View style={{flex:1}}>
        <ToolbarAndroid
          navIcon={require('image!ic_back_white')}
          titleColor="white"
          style={{backgroundColor: '#00a2ed',height: 56}}
          //actions={toolbarActions}
          title={movie.title}
          onIconClicked={this.goBack}
          />
        <WebView
          ref={WEBVIEW_REF}
          automaticallyAdjustContentInsets={false}
          //style={styles.webView}
          url={url}
          javaScriptEnabledAndroid={true}
          onNavigationStateChange={this.onNavigationStateChange}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
          startInLoadingState={true}
          scalesPageToFit={this.state.scalesPageToFit}
          renderLoading={this.renderLoading}
        />
      </View>
    );
  },
  renderLoading(){
     return (
      <View style={styles.loadingContainer}>
          <React.ProgressBarAndroid 
            color="#00a2ed"
            styleAttr="Inverse" 
          />
      </View>
    );
  },
  onShouldStartLoadWithRequest: function(event) {
    // IOS only.Implement any custom loading logic here, don't forget to return!
    console.info('onShouldStartLoadWithRequest--');
    return true;
  },
  onNavigationStateChange: function(navState) {  // 加载一次页面会有多次状态的变化?
    console.info('--onNavigationStateChange--',navState);
    this.setState({
      loading: navState.loading,
    });
  },
});

var styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#abcdef',
  },
  loadingContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#ebf9ff',
  },
});

module.exports = DetailScreen;