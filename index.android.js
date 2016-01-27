'use strict';
 
var React = require('react-native');
var {
  AppRegistry,
  Text,
  Image,
  View,
  StyleSheet,
  BackAndroid,
  Navigator
} = React;

var TimerMixin = require('react-timer-mixin');

var MainScreen = require('./MainScreen');
var DetailScreen = require('./DetailScreen');
var DataRepository = require('./DataRepository');

var repository = new DataRepository();

var _navigator;
// 后退事件
BackAndroid.addEventListener('hardwareBackPress', function() {
  console.info('--hardwareBackPress--',_navigator.getCurrentRoutes());
  if (_navigator && _navigator.getCurrentRoutes().length > 1) {
    _navigator.pop();
    return true;
  }
  return false;
});

var MovieApp = React.createClass({
  mixins: [TimerMixin],
  getInitialState() {
    return {
      isLoading: true, 
    };
  },  
  componentDidMount() { // 首屏动画结束 
    this.setTimeout(()=>{
      this.setState({isLoading: false});
    },1000);
    // 缓存第一页数据
    repository.cache.load({key:'m-page-1'}).then().catch( err => { 
      repository.fetch().then((rspData)=>{
          console.info('index load page 1',rspData);
          repository.cache.save({
            key:'m-page-1',
            rawData:rspData,
            expires:1000 * 360, // 3分钟缓存
          });
      });
    });

  },
  RouteMapper(route, navigationOperations, onComponentRef) {
    _navigator = navigationOperations;
    //console.info(route,navigationOperations);
    if (route.name == 'home') {
      return (
        <MainScreen navigator={navigationOperations} />
      );
    } else if (route.name == 'detail') {
      return (
        <DetailScreen navigator={navigationOperations} movie={route.movie}/>
      );
    }
  },
  render() {
    if (this.state.isLoading) 
      return this.renderLoadingView();

    let _initialRoute = {name: 'home'};
    return (
      <Navigator
        style={{flex:1}}
        initialRoute={_initialRoute}
        configureScene={() => Navigator.SceneConfigs.FloatFromRight} //FadeAndroid
        renderScene={this.RouteMapper}
      />
    );
  },
  renderLoadingView() {
    return (
      <View style={styles.loadingContainer}>
          <React.ProgressBarAndroid 
            color="#00a2ed"
            styleAttr="LargeInverse" // || "Large" ||"Inverse"
          />
      </View>
    );
  },
});

var styles = StyleSheet.create({
  loadingContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#ebf9ff',
  },
});

AppRegistry.registerComponent('Top_Movies', () => MovieApp);

