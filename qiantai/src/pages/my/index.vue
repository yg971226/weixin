<template>
  <div>
    <div v-if="isShow" class="noLogin">
      <!--            未登录状态显示的内容-->
      <img src="/static/images/user.png" alt="">
      <button size="mini"  @click="goToLogin">未登录</button>
    </div>

    <div v-else  class="login">
      <!--      登录之后显示的内容-->
      <div class="userinfo">
        <!--        存储的是登录用户的信息-->
        <img :src="userInfo.avatarUrl" alt="">
        <text>{{ userInfo.nickName }}</text>
        <button open-type="contact" size="mini">联系客服</button>
      </div>

      <div>
        <!--        放置所有的订单信息-->
        <div v-for="(item,index) in  orders" class="orderlist">
          <div>
            <text>收件人：{{ item.username }}</text>
          </div>
          <div>
            <text>联系方式：{{ item.phone }}</text>
          </div>
          <div>
            <text>收货地址：{{ item.address }}</text>
          </div>
          <div>
            <text v-if="item.status == 1">订单状态:新订单</text>
            <span v-else-if="item.status == 2">订单状态:已发货  <text @click="qrsh(item._id,index)">确认收货</text></span>
            <text v-else>订单状态:订单完成</text>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script>


  export default {
    data(){
      return {
        isShow:true,   //  true  未登录  false  已登录
        userInfo:{},  //  存的就是登录用户的用户信息
        orders:[] //  当前用户所有的订单
      }
    },
    methods:{
      //跳转到登录页面
      goToLogin(){
        wx.navigateTo({
          url:"/pages/login/main"
        })
      },

      getLoginUserInfo(){
        //进入缓存，获取用户信息，进行复制
        let  userInfo = {};
        userInfo.nickName = wx.getStorageSync('userinfo').nickName
        userInfo.avatarUrl = wx.getStorageSync('userinfo').avatarUrl

        //    进行赋值
        this.userInfo = userInfo;
        // console.log(this.userInfo)

      },

      getOrders(){
        //获取当前用户所有的订单信息
        let  that = this;
        let  nickName =   wx.getStorageSync('userinfo').nickName

        wx.request({
          url:"http://127.0.0.1:3001/wxapiGetUserOrders",
          data:{
            nickName
          },
          success(res) {
            console.log(res)
            that.orders = res.data
          }
        })


      },
      qrsh(id,index){
        // console.log(id)
        let  that = this;

        wx.request({
          url:"http://127.0.0.1:3001/wxapiChangeOrderStatus",
          data:{
            id,
            status:"3"
          },
          success(res) {
            console.log(res)
            // that.orders = res.data
            if(res.data.nModified){
              //确认收货成功
              that.orders[index].status = "3"
            }
          }
        })
      }
    },
    onShow(){
      //判断当前是否登录
      let  that =this;
      wx.getSetting({
        success(res) {
          //判断是否授权
          if(res.authSetting['scope.userInfo']){
            //授权了
            that.isShow = false;
            that.getLoginUserInfo();
            that.getOrders();

          }else{
            //没有授权
            that.isShow = true;
          }
        }
      })


    }
  }
</script>

<style scoped>
  .noLogin{
    margin-top: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .noLogin img{
    width: 70px;
    height: 70px;
    margin-bottom: 20px;
  }

  .login  .userinfo  img{
    width: 70px;
    height: 70px;
    margin-bottom: 20px;
    border-radius: 35px;
  }
  .login  .userinfo{
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 2px solid #ccc;
  }

  .orderlist{
    width: 90%;
    height: 140px;
    border: 1px solid #ccc;
    border-radius: 20px;
    margin-left: 5%;
    margin-top: 5px;
  }

</style>
