<template>
  <div>
   <!--list-->
    <div class="goodslist">
      <!--      商品显示 （新品的）-->
      <div v-for="(item,index) in  goods" :key="index">
        <text style="font-size: 18px">{{ item.goodsname }}</text>
        <text style="font-size: 14px;color: red">￥{{ item.price }}  新品</text>
        <img :src="item.goodspic" alt="">
      </div>

    </div>
    <!--没有商品-->
    <span  v-if="goods.length == 0">
        空空如也！！！
      </span>

  </div>
</template>

<script>
  import card from '@/components/card'

  export default {
data(){
    return{
      goods:[]
    }
  },
    methods:{
      getGoods(){
        let that = this
        let typeid = that.typeid;
//        console.log(typeid)

        //发起网络请求，获取当前类别下所有的商品
        wx.request({
          url:"http://127.0.0.1:3001/wxapiGetNewGoods",
          data:{
            status:{$ne:"3"},
            typeid,
            tag:"list"
          },
          success(res){
//            console.log(res)
            res.data.forEach((item,index)=>{
              res.data[index].goodspic = "http://127.0.0.1:3000/"+item.goodspic.replace('\\','/');

            })

            that.goods  =res.data;
          }

        })
      }
    },
    onLoad(option){   //这是一种接收参数的方法
//    console.log(option)
      let  {typeid,typename}  =option;

      wx.setNavigationBarTitle({
        title: typename+"商品"
      })

      this.typeid =  typeid
      this.getGoods()
    }
  }
</script>

<style scoped>

</style>
