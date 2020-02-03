<template>
  <div>
      <button open-type="getUserInfo" @getuserinfo="getuserinfo">登录</button>
  </div>
</template>

<script>


  export default {

    methods:{
      getuserinfo(res){
          // console.log(res)

        if(res.mp.detail.errMsg == "getUserInfo:ok"){
          //授权
            //将用户名保存起来，还有图片
            wx.setStorage({
               key:"userinfo",
              data:res.mp.detail.userInfo,
              success(r){
                  console.log(r)

                if(r.errMsg == "setStorage:ok"){
                  //登录成功
                  wx.navigateBack({
                    delta: 1
                  })
                }else{
                  //授权失败
                  wx.showToast({
                    title: '登录失败',
                    icon: 'success',
                    duration: 2000
                  })


                }
              }
            })


        }else{
          //未授权
          wx.showToast({
            title: '请先去登录',
            icon: 'success',
            duration: 2000
          })


        }
      }

    }
  }
</script>

<style scoped>

</style>
