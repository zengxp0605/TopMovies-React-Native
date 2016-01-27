'use strict';
 
var React = require('react-native');
var {
  Text,
  Image,
  ListView,
  View,
  StyleSheet,
  TouchableOpacity
} = React;

var NavigationDrawerList = React.createClass({
  getInitialState: function() {
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    return {
      dataSource: dataSource,
    };
  },
  componentDidMount: function() {
    let themes = [
      {name:'test1'},
      {name:'test2'},
      {name:'test3'},
    ];
     this.setState({
          dataSource: this.state.dataSource.cloneWithRows(themes),
      });
  },
  renderHeader: function() {
    var TouchableElement = TouchableOpacity;
    // if (React.Platform.OS === 'android') {
    //   TouchableElement = React.TouchableNativeFeedback;
    // }
    return(
      <View style={{flex: 1,flexDirection: 'column'}}>
        <View style={{flex: 1,backgroundColor: '#00a2ed'}}>
          <TouchableElement>
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 16}}>
              <Image
                source={require('image!comment_avatar')}
                style={{width: 40, height: 40, marginLeft: 8, marginRight: 8}} />
              <Text style={styles.menuText}>
                请登录
              </Text>
            </View>
          </TouchableElement>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableElement>
              <View style={styles.menuContainer}>
                <Image
                  source={require('image!ic_favorites_white')}
                  style={{width: 30, height: 30}} />
                <Text style={styles.menuText}>
                  我的收藏
                </Text>
              </View>
            </TouchableElement>
            <TouchableElement>
              <View style={styles.menuContainer}>
              <Image
                source={require('image!ic_download_white')}
                style={{width: 30, height: 30}} />
                <Text style={styles.menuText}>
                  离线下载
                </Text>
              </View>
            </TouchableElement>
          </View>
        </View>
        <TouchableElement onPress={() => this.props.onSelectItem(null)}>
          <View style={styles.themeItem}>
            <Image
              source={require('image!home')}
              style={{width: 30, height: 30, marginLeft: 10}} />
            <Text style={styles.homeTheme}>
              首页
            </Text>
          </View>
        </TouchableElement>
      </View>
    );
  },
  renderRow: function(
    theme: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    var TouchableElement = TouchableOpacity;
    return (
      <View>
        <TouchableElement
          onPress={() => this.props.onSelectItem(theme)}
          onShowUnderlay={highlightRowFunc}
          onHideUnderlay={highlightRowFunc}>
          <View style={styles.themeItem}>
            <Text style={styles.themeName}>
              {theme.name}
            </Text>
          </View>
        </TouchableElement>
      </View>
    );
  },
  render: function() {
    return (
      <View style={{flex:1}}>
        <ListView
          ref="NavigationDrawerList"
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={false}
          renderHeader={this.renderHeader}
          style={{flex:1, backgroundColor: 'white'}}
        />
      </View>
    );
  },
});

var styles = StyleSheet.create({ 
  menuContainer: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  menuText: {
    fontSize: 14,
    color: 'white',
  },
  homeTheme: {
    fontSize: 16,
    marginLeft: 16,
    color: '#00a2ed'
  },
  themeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  themeName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },

});

module.exports = NavigationDrawerList;