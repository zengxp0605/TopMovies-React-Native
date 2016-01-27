'use strict';

var React = require('react-native');

var {
　　AppRegistry,
	DrawerLayoutAndroid,
	ToolbarAndroid,
　　View,
　　Navigator,
　　Text,
　　BackAndroid,
　　StyleSheet,

} = React;

var SampleApp = React.createClass({
    configureScene(route){
     return Navigator.SceneConfigs.FadeAndroid;
    },
    renderScene(router, navigator){
      var Component = null;
      this._navigator = navigator;
      switch(router.name){
        case "welcome":
          Component = WelcomeView;
          break;
        case "test":
          Component = TestView;
          break;
        case "movies":
          Component = MoviesView;
          break;
        default: //default view
          Component = DefaultView;
      }
      return <Component title={router.name} navigator={navigator} />
    },

    componentDidMount() {
      // var navigator = this._navigator;
      // BackAndroid.addEventListener('hardwareBackPress', function() {
      //     if (navigator && navigator.getCurrentRoutes().length > 1) {
      //       navigator.pop();
      //       return true;
      //     }
      //     return false;
      // });
    },

    componentWillUnmount() {
      // BackAndroid.removeEventListener('hardwareBackPress');
    },

    render() {
        return (
            <Navigator
                initialRoute={{name: 'welcome'}}
                configureScene={this.configureScene}
                renderScene={this.renderScene} />
        );
    }

});

var WelcomeView = React.createClass({
    onPressFeed() {
        this.props.navigator.push({name: 'test'});
    },
    onPressMovies() {
        this.props.navigator.push({name: 'movies'});
    },
    goBack(){
      this.props.navigator.push({name:"default"});
    },
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome} onPress={this.onPressFeed} >
                    This is welcome view.Tap to go to test view.
                </Text>
                <Text style={styles.welcome} onPress={this.onPressMovies} >
                    ---- Tap to movies list.
                </Text>
                 <Text style={styles.welcome} onPress={this.goBack} >
                    Tab to default view!
                </Text>
            </View>
        );
    }

});

var DefaultView = React.createClass({
 	configureScene(route){
		return Navigator.SceneConfigs.FloatFromRight;
	},
    render(){
      return (
          <View style={styles.container}>
              <Text style={styles.welcome}>Default view</Text>
          </View>
      )
    }
});


var TestView = React.createClass({
    render() {
      var navigationView = (
	    <View style={{flex: 1, backgroundColor: '#fff'}}>
	      <Text style={{margin: 10, fontSize: 15, textAlign: 'left'}}>I'm in the Drawer!</Text>
	    </View>
	  );
	  return (
	    <DrawerLayoutAndroid
	      drawerWidth={300}
	      drawerPosition={DrawerLayoutAndroid.positions.Right}
	      renderNavigationView={() => navigationView}>
	      <View style={{flex: 1, alignItems: 'center'}}>
	        <Text style={{margin: 10, fontSize: 15, textAlign: 'right'}}>Hello</Text>
	        <Text style={{margin: 10, fontSize: 15, textAlign: 'right'}}>World!</Text>
	      </View>
	    </DrawerLayoutAndroid>
	  );
    }
});


var REQUEST_URL = 'https://raw.githubusercontent.com/facebook/react-native/master/docs/MoviesExample.json';

var MoviesView = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loaded: false, // 设置标示位
    };
  },
  //componentDidMount是React组件的一个方法，它会在组件刚加载完成的时候调用一次，以后不再会被调用。
  componentDidMount: function() { 
    this.fetchData();
  },
  fetchData:function(){
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.movies),
          loaded: true, // 将标示位置为已加载
        });
      })
      .done();
  },
  render:function(){
  if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    //var movie = this.state.movies[0];
    //return this.renderMovie(movie);
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderMovie}
        style={styles.listView}
      />
    );
  },
  renderLoadingView: function() {
    return (
      <View style={styles.mainContainer}>
        <Text>
          正在加载电影数据……
        </Text>
      </View>
    );
  },
  renderMovie: function(movie) {
    return (
      <View style={styles.mainContainer}>
        <Image 
        style={styles.thumb}
        source={{uri: movie.posters.thumbnail}}
      />   
        <View style={styles.rightContainer}>
        <Text style={styles.title}>{movie.title}</Text>   
        <Text style={styles.year}>{movie.year}</Text> 
      </View>  
      </View>
    );
  }
});

var styles = StyleSheet.create({
   mainContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightContainer: {
    flex: 1,
  },
  thumb: {
    width: 53,
    height: 81,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  year: {
    textAlign: 'center',
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },

	container:{
		flex:1,
		justifyContent:'center',
		alignItems:'center',
		backgroundColor:'#f5fcff',
	},
	welcome:{
		fontSize:30,
		textAlign:'center',
		margin:10,
	},
	instructions:{
		textAlign:'center',
		color:'#333333',
		marginBottom:5,
	},

});


AppRegistry.registerComponent('helloworld', () => TestView);
