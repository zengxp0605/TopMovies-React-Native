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
  TouchableHighlight,
  ToastAndroid,
  ProgressBarAndroid,
} = React;

var NavigationDrawerList = require('./NavigationDrawerList');

// url 模板,每次替换页码
var REQUEST_URL_TPL = 'https://raw.githubusercontent.com/zengxp0605/test/master/movies/page_{page}.json';
var PAGE = 1; // start page
var globalArry = [];

var DRAWER_REF = 'drawer';
var DRAWER_WIDTH_LEFT = 156
var toolbarActions = [
  {title: '提醒', icon: require('image!ic_message_white'), show: 'always'},
  {title: '夜间模式', show: 'never'},
  {title: '设置选项', show: 'never'},
];

var MainView = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loadStatus: 'start', // 设置标示位
      isToTopRefreshing: false, // 
      theme:null
    };
  },  
  componentDidMount: function() {// 初始化页面后,加载第一页
    this.loadNewPage();
  },
  loadNewPage:function(){
    this.setState({loadStatus: 'loading'}); // 显示加载中
    var page_url = REQUEST_URL_TPL.replace('{page}',PAGE);
    console.info('Wating for next page, Fetching from: ' + page_url);
    let _loadStatus = 'loadmore';
    let that = this;
   
    fetch(page_url)
      .then(function(rsp){
        if(!rsp.ok){ // 加载中出现网络错误等原因将一直显示加载中
          setTimeout(()=>{
            that.setState({
              loadStatus: 'loadmore', // 解决: 重置为 loadmore 状态
            });
          },2000);
          throw new Error('Code:'+ rsp.status + ' ' + rsp._bodyText);
        }
        return rsp.json();
      })
      .then((rspData) => {  
        let endPage = Math.ceil(rspData.total/rspData.pageSize);
        globalArry = globalArry.concat(rspData.rows);
        console.info('Get Page ' + PAGE,rspData,globalArry);  
        PAGE++;
        console.log(PAGE,endPage);
        if(PAGE > endPage){
          _loadStatus = 'end'; // 将标示位置为已加载完毕
           ToastAndroid.show('加载完毕', ToastAndroid.SHORT);
        }
        that.setState({
          dataSource: this.state.dataSource.cloneWithRows(globalArry),
          loadStatus: _loadStatus, // 将标示位置为已加载
          isToTopRefreshing: false, // 取消顶部正在加载图标
        });
      })
      //.done();
      .catch((e) => {
        ToastAndroid.show(e.message, ToastAndroid.LONG);
        console.error("Oops, error", e)
      });
  },
  render: function() {
    var _onEndReached = this.loadNewPage;
    if (this.state.loadStatus === 'start') {
      return this.renderLoadingView();
    }else if(this.state.loadStatus ==='end'){ // 加载完毕,隐藏 'Load more'
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
              //navIcon={{uri:'https://raw.githubusercontent.com/zengxp0605/test/master/ic_menu_white.png'}}
              title='首页'
              titleColor="white"
              style={styles.toolbar}
              actions={toolbarActions}
              onIconClicked={() => this.refs[DRAWER_REF].openDrawer()}
              //onActionSelected={this.onActionSelected} 
              />

                <PullToRefreshViewAndroid
                  style={{flex: 1}}
                  refreshing={this.state.isToTopRefreshing}
                  onRefresh={this._onPullTopRefresh}
                  colors={['#fff']}
                  progressBackgroundColor={'#00a2ed'}
                  >
                      <ListView
                        initialListSize={30}
                        pageSize = {10}
                        onChangeVisibleRows={()=>{console.log('--onChangeVisibleRows--')}}
                        onEndReached={_onEndReached} // 每次滚动到底部时,加载下一页数据
                        onEndReachedThreshold={5}
                        style={styles.listView}
                        dataSource={this.state.dataSource}
                        renderRow={(rowData) => <MovieView movie={rowData} />}
                        //renderHeader ={()=><View style={{backgroundColor:'pink',height:20}}><Text style={{textAlign:'center'}}>--Header--</Text></View>}
                        renderFooter ={()=><LoadMoreTestView status={this.state.loadStatus}/>}
                        //renderSectionHeader = {this.renderSectionHeader}
                      />
                </PullToRefreshViewAndroid>
          </View>
        </DrawerLayoutAndroid>  
      );
  },
  readerHeader(){
    return (
      <View style={{backgroundColor:'red',flex:1,height:20}}>
        <Text>----Header-----</Text>
      </View>
    );
  },
  _onPullTopRefresh() { // 下拉到顶部后refresh 第一页,TODO 这里数据不会更新
    globalArry = [];
    PAGE = 1;
    this.setState({
      //dataSource: this.state.dataSource.cloneWithRows(globalArry),
      isToTopRefreshing: true,
    });
    this.loadNewPage();
  },
  renderLoadingView: function() {
    console.log('ProgressBarAndroid');
    return (
      <View style={styles.loadingContainer}>
          <ProgressBarAndroid 
            //style={{height: 40}}
            color="#00a2ed"
            styleAttr="LargeInverse" //"Large" //"Inverse"
          />
      </View>
    );
  },
  onSelectTheme: function(theme) {
    console.info('---onSelectTheme--');
    this.refs[DRAWER_REF].closeDrawer();
    this.setState({theme: theme});
  },
  _renderNavigationView: function() {
    return (
      <NavigationDrawerList onSelectItem={this.onSelectTheme} />
    );
  },
  renderSectionHeader(){
    return (
      <View style={styles.section}>
        <Text style={styles.sectionText}>Section Header</Text>
      </View>
    );
  },
});

var LoadMoreTestView = React.createClass({
  render(){
    if(this.props.status === 'end'){
      return (<View style={{height:0}}></View>); // 加载完毕后不显示加载更多
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

var MovieView = React.createClass({
  // shouldComponentUpdate(nextProps, nextState) {
  //   return false;
  // },
  toDetail(){
    console.log(this.props.movie);
    ToastAndroid.show(this.props.movie.title,ToastAndroid.SHORT);
  },
  render() {
    var movie = this.props.movie;
    return (
      <View style={styles.rowContainer}>
        <Image 
          style={styles.thumb}
          source={{uri: movie.img}}
        />   
        <View style={styles.rightContainer}>
           <View style={styles.detailWrap}> 
              <React.TouchableHighlight onPress={this.toDetail}>
                <Text style={styles.title}>{movie.title}</Text> 
              </React.TouchableHighlight>
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
    );
  }
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
  toolbar: {
    backgroundColor: '#00a2ed',
    height: 56,
  },
  rightContainer: {
    flex: 1,
    height:81,
  },
  detailWrap:{
    flexDirection:'row',
    justifyContent:'space-between',
    //backgroundColor:'#eee',
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
    //backgroundColor:'#aaa',
  },
  score:{
    flex:1,
    color:'hotpink',
    textAlign:'right',
    //backgroundColor:'yellow',
    //textAlign:'center',
  },
  year: {
    //backgroundColor:'red',
    textAlign: 'left',
    //paddingLeft:50,
  },
  desc:{
    paddingLeft:10,
    paddingRight:10,
    //backgroundColor:'#ccc',
  },
  loadMore:{
    flexDirection:'row',
    backgroundColor:'rgba(0,0,0,0.04)',
    height:35,
    justifyContent:'center',
    alignItems: 'center',
  },

/*--test--*/
  section:{
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 6,
    backgroundColor: '#2196F3',
  },
  sectionText:{
    color: 'white',
    paddingHorizontal: 8,
    fontSize: 16,
  },
});

AppRegistry.registerComponent('Top_Movies', () => MainView);

