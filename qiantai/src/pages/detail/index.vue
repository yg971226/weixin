<template>
  <div>
    <img :src="goods.goodspic" alt=""  class="img">

    <div class="info">
      <div style="padding: 5px">
        <text>商品名称：{{ goods.goodsname }}</text>
        <text style="margin-left: 10px;font-size: 13px;color: red">￥{{ goods.price }}</text>
      </div>
      <div style="padding: 5px">
        <div>商品描述：</div>
        <text style="margin-left: 20px;font-size: 14px">{{ goods.desc }}</text>
      </div>

    </div>

    <div class="bottom">
      <img src="/static/tabs/sort.png" alt="">
      <img src="/static/tabs/cart.png" alt=""  @click="goToCart">
      <text>立即购买</text>
      <text  @click="addCart">加入购物车</text>
    </div>
  </div>
</template>

<script>
  import card from '@/components/card'

  export default {
    data(){
        return{
          goodsid:"",
          goods:[]
        }
    },
    onLoad(options){
      let  {goodsid,goodsname}  =options;

      wx.setNavigationBarTitle({
        title: goodsname+"详情"
      })

      this.goodsid = goodsid;
      //获取商品详情
      this.getGoodsDetail()
    },
    methods:{
//        跳转到购物车
      goToCart(){

//          判断是否登录授权
        wx.getSetting({
          success(res){
//            console.log(res)
            if(res.authSetting['scope.userInfo']){
//                已经授权   跳转到购物车
              wx.switchTab({
                url:"/pages/cart/main"
              })

            }else{
//                没有授权
//              去授权
              wx.showModal({
                title: '提示',
                content: '请先去登录',
                success (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url:"/pages/login/main"
                    })
                  }
                }
              })
            }
          }

        })
      },
      //          加入购物车操作
      addCart(){
          let that =this
//      先判断是否登录 （授权）
        wx.getSetting({
          success(res){
//            console.log(res)
            if(res.authSetting['scope.userInfo']){
//                已经授权  执行插入数据库操作
//                  获取商品的id  和用户名
              let goodsid =that.goodsid
              let  nickName = wx.getStorageSync('userinfo').nickName;
//              console.log(nickName)

              wx.request({
                url:"http://127.0.0.1:3001/wxapiAddCart",
                data:{
                  goodsid,
                  nickName
                },
                success(result){
                  // console.log(result.errMsg)
                  if(result.errMsg == "request:ok"){
                    //购物车添加成功
                    wx.showToast({
                      title: '添加成功',
                      icon: 'success',
                      duration: 2000
                    })


                  }else{
                    //购物车添加失败
                    wx.showToast({
                      title: '添加失败',
                      icon: 'success',
                      duration: 2000
                    })


                  }
                }
              })


            }else{
//                没有授权
//              去授权
              wx.showModal({
                title: '提示',
                content: '请先去登录',
                success (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url:"/pages/login/main"
                    })
                  }
                }
              })
            }
          }

        })

      },
      getGoodsDetail(){
        //获取当前商品的详情信息
        console.log(1111111)
        let  that = this;
        let  goodsid = that.goodsid; //  查询的条件

        wx.request({
          url:"http://127.0.0.1:3001/wxapiGetNewGoods",
          data:{
            _id:goodsid,
            tag:"detail"
          },
          success(res){
            console.log(res.data[0])
//             console.log(res.data[1])


            res.data[0].goodspic ="http://127.0.0.1:3000/"+res.data[0].goodspic.replace('\\','/');
            that.goods=res.data[0]
          }
        })


      },

    }
  }
</script>

<style scoped>
  .img{
    width: 100%;
    height: 400px;
  }

  .info{
    border-top: 1px solid  #ccc;
  }

  .bottom{
    width: 100%;
    height: 60px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    position: fixed;
    bottom: 0px;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .bottom img{
    width: 50px;
    height: 50px;
  }
</style>
