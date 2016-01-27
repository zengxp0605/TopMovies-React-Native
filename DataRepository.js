'use strict';

var React = require('react-native');

import Storage from 'react-native-storage';


// url 模板,每次替换页码
var REQUEST_URL_TPL = 'https://raw.githubusercontent.com/zengxp0605/test/master/movies/page_{page}.json';

function DataRepository() { // Singleton pattern
  if (typeof DataRepository.instance === 'object') {
    return DataRepository.instance;
  }
  console.log('DataRepository -- init');
  this.PAGE = 1;
  this.cache =  new Storage({
    //最大容量，默认值1000条数据循环存储
    size: 1000,    
    //数据过期时间，默认一整天（1000 * 3600 * 24秒）
    defaultExpires: 1000 * 3600 * 24,
    //读写时在内存中缓存数据。默认启用。
    enableCache: true,
    //如果storage中没有相应数据，或数据已过期，
    //则会调用相应的sync同步方法，无缝返回最新数据。
    sync : {
      //同步方法的具体说明会在后文提到
    }
  });

  DataRepository.instance = this;
}



DataRepository.prototype.test=function(){
  console.log('DataRepository::test');
}

DataRepository.prototype.getPage =  function(){
  return this.PAGE;
}

DataRepository.prototype.setPage =  function(page = 1){
  this.PAGE = page;
}
DataRepository.prototype.incrPage =  function(){
  this.PAGE = this.PAGE + 1;
  console.log('incrPage',this.PAGE);
}

DataRepository.prototype.fetch =  function(url=''){
   if(!url)
      url = REQUEST_URL_TPL.replace('{page}',this.PAGE);
    console.info('Wating... => DataRepository Fetching from: ' + url);
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => response.json())
        .then((responseData) => {
          //console.log(responseData);
          resolve(responseData);
        })
        .catch((e) => {
          console.error(e);
          resolve(null);
        });
    });
}

module.exports = DataRepository;