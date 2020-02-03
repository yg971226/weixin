<template>
  <div>
    <!--搜索框-->
    <mp-searchbar :isFocus=true :inputValue="inputValue" :placeholder="placeholder" @input="input" @blur="blur" @focus="focus" @confirm="confirm"></mp-searchbar>

    <!--顶部轮播图-->

    <swiper
      indicator-dots
      indicator-active-color="#fff"
      circular
      autoplay
      interval="2000"
    >
      <swiper-item v-for="(item,index)  in  lunbo " :key="index" >
        <img :src="item" alt="">
      </swiper-item>
    </swiper>

    <div class="typelist">
     <!--分类导航-->
    <swiper  indicator-dots
             indicator-active-color="#ccc">
      <swiper-item v-for="(item,index)  in  info " :key="index">
        <div v-for="(value,key)  in  item " :key="key" class="typeNav" @click="goToList(value._id,value.typename)">
          <img :src="value.typepic" alt="">
          <span style="font-size: 14px">{{value.typename}}</span>
        </div>
      </swiper-item>
    </swiper>
    </div>

    <div class="banner">
      <!--        广告图片-->
      <img src="/static/images/lunbo2.jpg" alt="">
    </div>

    <div class="goodslist">
      <!--      商品显示 （新品的）-->
      <div v-for="(item,index) in  newGoods" :key="index" @click="goToDetail(item._id,item.goodsname)">
        <text style="font-size: 18px">{{ item.goodsname }}</text>
        <text style="font-size: 14px;color: red">￥{{ item.price }}  新品</text>
        <img :src="item.goodspic" alt="">
      </div>

  </div>

  </div>
</template>

<script>import mpSearchbar from 'mpvue-weui/src/searchbar';

export default {
  components: {
    mpSearchbar,
  },
  data(){
      return{
        lunbo:[
            "/static/images/lunbo1.jpg",
          "/static/images/lunbo5.jpg",
          "/static/images/lunbo3.jpg",
          "/static/images/lunbo4.jpg",
        ],
        newGoods:[],

        info:[]
      }
  },
  onShow(){
    this.getNewGoods()
    this.getType()
  },
  methods:{

//      请求数据
      getType(){
          let that =this
          let info =[]       //  用来存放处理过后的数组
//        这里用vue或者wx的请求数据接口的方法均可
        wx.request({
          url:"http://127.0.0.1:3001/wxapiGetTypes",
          data:{},
          success(res){
              console.log(res.data)
//

           //  修改图片路径的错误
            res.data.forEach((item,index)=>{
              res.data[index].typepic = "http://127.0.0.1:3000/"+item.typepic.replace('\\','/');

            })


            let len = Math.ceil(res.data.length/10)  //   向上取整获得循环的次数
//            console.log(len)

            for(let i= 1;i<=len;i++){

              if(i>=len){
//                console.log('最后一次')
                info.push(res.data)
              }else{
//                console.log('前面所有次数')
                let arr =res.data.splice(0,10) //返回被删除的部分

                info.push(arr)
              }
            }
//        console.log(info)
            that.info=info
          }
        })

    },
    getNewGoods(){
      let that = this;

      wx.request({
        url:"http://127.0.0.1:3001/wxapiGetNewGoods",
        data:{
          status:"1",
          tag:"index"
        },
        success(res){
//           console.log(res)
          res.data.forEach((item,index)=>{
            res.data[index].goodspic = "http://127.0.0.1:3000/"+item.goodspic.replace('\\','/');

          })

          that.newGoods  =res.data;
        }
      })

    },
    goToList(typeid,typename){
//        console.log(typeid,typename)
      wx.navigateTo({
        url:`/pages/list/main?typeid=${typeid}&typename=${typename}`
      })
    },
    goToDetail(goodsid,goodsname){
//      console.log(typeid,goodsname)
      wx.navigateTo({
        url:`/pages/detail/main?goodsid=${goodsid}&goodsname=${goodsname}`
      })
    }
  }
}
</script>

<style scoped>
img{width:100%;
  height:100%;}

.typelist swiper{height: 185px;  }
  .typeNav{width:70px;height:80px;border:1px solid #ccc;float: left}

.typelist img{
  width: 40px;
  height: 50px;
}

.typelist div{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.banner img{
  width: 100%;
  height: 105px;
}
.goodslist div{
  width: 32%;
  height: 165px;
  border: 1px solid  #ccc;
  float: left;
  margin-left: 2px;
  display: flex;
  justify-content: center;;
  flex-direction: column;
  align-items: center;
}

.goodslist img{
  width: 70px;
  height: 90px;
  border-radius: 20px;
}
</style>
