<template>
  <div>
    <form  @submit="order">
      收件人：
      <input name="username"></input>
      联系方式:
      <input name="phone"></input>
      <picker mode="region" name="region" @change="regionChange">
        <view class="picker" :value="region">
          收货地址：{{ region[0] }}{{ region[1] }}{{ region[2] }}
        </view>
      </picker>

      详细地址：
      <input name="address"></input>


      <button form-type="submit">下单</button>
    </form>
  </div>
</template>

<script>


  export default {
      data(){
        return {
          region:["北京市","北京市","朝阳区"]
        }
      },

    methods:{
      order(e){
          console.log(e)

         let  username  =  e.mp.detail.value.username;   //收件人
         let  phone  =  e.mp.detail.value.phone;
         let  region  =  e.mp.detail.value.region;  // 省市区
         let  address  =  e.mp.detail.value.address; //详细地址

         let  newaddress  =  region.join("")+address;

         let  nickName = wx.getStorageSync('userinfo').nickName; //购买人

         // console.log(this.$root.$mp.query.total)
        let  total = this.$root.$mp.query.total //总价

        wx.request({
          url:"http://127.0.0.1:3001/wxapiInsertOrder",
          data:{
            username,
            phone,
            newaddress,
            nickName,
            total
          },
          success(res){
              // console.log(res)
            if(res.data.ok){
              wx.showToast({
                title:"下单成功",
                //自定义跳转页面
                success(){
                  wx.switchTab({
                    url:"/pages/my/main"
                  })
                }
              })
            }
          }
        })
      },
      regionChange(e){
        // console.log(e)
        let  region = e.mp.detail.value;

        this.region = region;
      }
    }
  }
</script>

<style scoped>

</style>
