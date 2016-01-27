'use strict';
 
var React = require('react-native');
var {
  AppRegistry,
  Text,
  Image,
  ListView,
  View,
  StyleSheet,
  PullToRefreshViewAndroid,
  ToolbarAndroid,
  DrawerLayoutAndroid,
  TouchableOpacity,
  ToastAndroid,
  ProgressBarAndroid,
  BackAndroid,
  Navigator
} = React;

var TimerMixin = require('react-timer-mixin');

var NavigationDrawerList = require('./NavigationDrawerList');
var DataRepository = require('./DataRepository');

var repository = new DataRepository();

var globalArry = [];

var DRAWER_REF = 'drawer';
var DRAWER_WIDTH_LEFT = 156
var toolbarActions = [
  {title: '提醒', icon: require('image!ic_message_white'), show: 'always'},
  {title: '夜间模式', show: 'never'},
  {title: '设置选项', show: 'never'},
];


var MainScreen = React.createClass({
  mixins: [TimerMixin],
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loadStatus: 'loading', 
      isToTopRefreshing: false, 
      theme:null
    };
  },  
  componentDidMount: function() {// 初始化页面后,加载第一页
    let _that = this;
    repository.cache.load({key:'m-page-1'}).then(rs =>{
      console.info('form cache',rs);
      _that.renderNewPage(rs); // 获取缓存后直接显示第一页数据
      repository.incrPage();
    }).catch(err => { // 没有缓存数据则重新获取第一页
      repository.setPage(1);
      _that.loadPage();
    });
  },
  loadPage(){
    this.setState({loadStatus:'loading'}); // 显示加载中
    let _that = this;
    repository.fetch().then(rspData => {
      if(!rspData){  // 加载中出现网络错误等原因将一直显示加载中
        _that.setTimeout(()=>{ 
          _that.setState({  
            loadStatus: 'loadmore', // 解决: 重置为 loadmore 状态
          });
        },2000);
        throw new Error('Fetch data failed...');
      }
      let _loadStatus = 'loadmore';
      let endPage = Math.ceil(rspData.total/rspData.pageSize);
      console.info('rspData-- ',repository.getPage(),rspData);
      if(repository.getPage() >= endPage){
        _loadStatus = 'end'; // 将标示位置为已加载完毕
        //ToastAndroid.show('No more data', ToastAndroid.SHORT);
      }
      _that.renderNewPage(rspData,_loadStatus);
      repository.incrPage();
    }).catch(e =>{   //  fetch error
      ToastAndroid.show(e.message, ToastAndroid.LONG);
    });
  },
  renderNewPage(data,loadStatus='loadmore'){
    globalArry = globalArry.concat(data.rows);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(globalArry),
      loadStatus: loadStatus, // 
      isToTopRefreshing: false, // 取消顶部正在加载图标
    });
  },
  render: function() {
    var _onEndReached = this.loadPage;
    if(this.state.loadStatus ==='end'){ // 加载完毕,隐藏 'Load more'
      _onEndReached = null;
    }

    return (
       <DrawerLayoutAndroid
        ref={DRAWER_REF}
        drawerWidth={React.Dimensions.get('window').width - DRAWER_WIDTH_LEFT}
        keyboardDismissMode="on-drag"
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={this._renderNavigationView}>
         <View style={{flex:1}}>
           <ToolbarAndroid
              navIcon={require('image!ic_menu_white')}
              title='首页'
              titleColor="white"
              style={{backgroundColor: '#00a2ed',height: 56}}
              actions={toolbarActions}
              onIconClicked={() => this.refs[DRAWER_REF].openDrawer()}
              onActionSelected={this.onActionSelected} 
              />
                <PullToRefreshViewAndroid
                  style={{flex: 1}}
                  refreshing={this.state.isToTopRefreshing}
                  onRefresh={this._onPullTopRefresh}
                  colors={['#fff']}
                  progressBackgroundColor={'#00a2ed'}
                  >
                      <ListView
                        initialListSize={5}
                        pageSize = {5}
                        onChangeVisibleRows={()=>{console.log('--onChangeVisibleRows--')}}
                        onEndReached={_onEndReached} // 每次滚动到底部时,加载下一页数据
                        onEndReachedThreshold={5}
                        style={styles.listView}
                        dataSource={this.state.dataSource}
                        renderRow={(rowData) => <MovieItem movie={rowData} navigator={this.props.navigator}/>}
                        renderFooter ={()=><LoadMoreView status={this.state.loadStatus}/>}
                      />
                </PullToRefreshViewAndroid>
          </View>
        </DrawerLayoutAndroid>  
      );
  },
  _onPullTopRefresh() { // 下拉到顶部后refresh 第一页,TODO 这里数据不会更新
    globalArry = [];
    repository.setPage(1);
    this.setState({
      isToTopRefreshing: true,
    });
    this.loadPage();
  },
  onActionSelected(){
    ToastAndroid.show("This is demo. --onActionSelected",ToastAndroid.SHORT);
  },
  onSelectTheme: function(theme) {
    this.refs[DRAWER_REF].closeDrawer();
    this.setState({theme: theme});
    ToastAndroid.show("This's  just for test.",ToastAndroid.SHORT);
  },
  _renderNavigationView: function() {
    return (
      <NavigationDrawerList onSelectItem={this.onSelectTheme} />
    );
  },
});

var MovieItem = React.createClass({
  // shouldComponentUpdate(nextProps, nextState) {
  //   return false;
  // },
  toDetail(){
    this.props.navigator.push({
      name:'detail',
      movie:this.props.movie,
    });
  },
  render() {
    var movie = this.props.movie;
    return (
      <React.TouchableOpacity onPress={this.toDetail}>
        <View style={styles.rowContainer}>
          <Image 
            style={styles.thumb}
            source={{uri: movie.img}}
          />   
          <View style={styles.rightContainer}>
             <View style={styles.detailWrap}> 
                <Text style={styles.title}>{movie.title}</Text> 
                <Text style={{paddingRight:10}}>
                  <Text style={styles.year}>{movie.year}年</Text> 
                  <Text style={styles.score}>    {movie.score}分</Text> 
                </Text>  
             </View>  
             <View style={styles.desc}>
                <Text>~{movie.desc}</Text> 
             </View>
          </View>  
        </View>
      </React.TouchableOpacity>
    );
  }
});

var LoadMoreView = React.createClass({
  render(){
    if(this.props.status === 'end'){
      return (<View style={{height:0}} />); // 加载完毕后不显示加载更多
    }

    if(this.props.status === 'loading'){
      return (
        <View style={styles.loadMore}>
          <ProgressBarAndroid 
            style={{height: 20,width:26}}
            color="#00a2ed"
            styleAttr="Inverse" 
          />
          <Text style={{}}>Loading...</Text>
        </View> 
      );
    }else{
      return (
        <View style={styles.loadMore}>
             <Text style={{textAlign:'center'}}>Load more...</Text>
        </View> 
      );
    }
  },
});


var styles = StyleSheet.create({
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    padding:5,
    paddingLeft: 10,
    borderBottomColor:'rgba(0,0,0,0.06)',
    borderBottomWidth:1,
  },
  loadingContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#ebf9ff',
  },
  rightContainer: {
    flex: 1,
    height:81,
  },
  detailWrap:{
    flexDirection:'row',
    justifyContent:'space-between',
    paddingTop: 10,
    paddingBottom:12,
  },
  listView: {
    backgroundColor: '#F5FCFF',
  },
  thumb: {
    width: 53,
    height: 81,
  },
  title: {
    fontSize: 18,
    marginLeft:10,
  },
  score:{
    flex:1,
    color:'hotpink',
    textAlign:'right',
  },
  year: {
    textAlign: 'left',
  },
  desc:{
    paddingLeft:10,
    paddingRight:10,
  },
  loadMore:{
    flexDirection:'row',
    backgroundColor:'rgba(0,0,0,0.04)',
    height:35,
    justifyContent:'center',
    alignItems: 'center',
  },
});


module.exports = MainScreen;