//  专门为小程序提供接口的文件

let  express =   require('express');
//1-2 实例化
const   app =  new  express()

let  MongoClient =  require('mongodb').MongoClient;
let  ObjectId  =require('mongodb').ObjectId;
let  DBurl = "mongodb://127.0.0.1:27017/myshop";
//1-3 设置接口
// 获取所有类别的接口
app.get('/wxapiGetTypes',function(req,res){
    // let  data = {
    //     code:"1",
    //     msg:"请求成功",
    //     body:[1,2,3,4,5]
    // }
    // res.send(data)
    MongoClient.connect(DBurl,function(err,db){
        db.collection('type').find().toArray(function(e,types){
            // res.send(types)
            res.writeHead(200,{"Content-Type":"application/json"})

            res.write(JSON.stringify(types))

            res.end()
        })
    })

})
// 获取新品的商品[ 很多处都可以使用该接口查询商品--按条件查询 ]
app.get('/wxapiGetNewGoods',function(req,res){

    let  where  =req.query;  //  1  status:"1" {status:"1"}

    if(where.tag == "list"){
        // list
        where.status = JSON.parse(where.status)

        delete   where.tag;
    }else if(where.tag == "index"){
        //index 首页
        delete where.tag;
    }else if(where.tag == "detail"){
        //详情页面

        delete  where.tag;

        where._id = ObjectId(where._id)

        // console.log(where)
    }

    // console.log(where)
    // status != 3
    // let  where = {
    //     status:{$ne:"3"}
    // }
    MongoClient.connect(DBurl,function(err,db){
        db.collection('goods').find(where).toArray(function(e,goods){
            // res.send(types)
            res.writeHead(200,{"Content-Type":"application/json"})

            res.write(JSON.stringify(goods))

            res.end()
        })
    })

})

//插入购物车接口
app.get("/wxapiAddCart",function(req,res){
    let  {goodsid,nickName} = req.query;

    // console.log(goodsid,nickName)
    let num = 1;
    let checked = "1" //选中状态
    let username  =nickName;
    //执行添加
    MongoClient.connect(DBurl,function(err,db){

        //在做购物车添加之前，需要判断一下，当前商品，当前用户，是否加入过购物车
        db.collection('cart').find({
            username,
            goodsid
        }).toArray(function(e,r){
            // console.log(r,'123')
                if(r.length){
                    //证明之前此用户加入过购物车
                    let  oldNum = r[0].num; //原来购买的数量
                    oldNum++;
                    db.collection('cart').updateOne({
                        username,
                        goodsid
                    },{$set:{
                        num:oldNum
                        }},function(es,rs){
                        res.writeHead(200,{"Content-Type":"application/json"})

                        res.write(JSON.stringify(rs))

                        res.end()
                    })
                    // console.log(r)
                }else{

                    //新的商品，没加入过
                    db.collection('cart').insertOne({
                        num,checked,username,goodsid
                    },function(es,rs){
                        res.writeHead(200,{"Content-Type":"application/json"})

                        res.write(JSON.stringify(rs))

                        res.end()
                    })
                }
        })


    })

})


//获取当前用户的购物车信息
app.get('/wxapiGetUserCarts',function(req,res){
    //1.获取用户名称
    let username = req.query.username;
    MongoClient.connect(DBurl,function(err,db){

        db.collection('cart').find({username}).toArray(function(e,carts){

            new Promise((resolve,reject)=>{
                carts.forEach((item,index)=>{
                    db.collection('goods').findOne({
                        _id:ObjectId(item.goodsid)
                    },function(er,rs){
                        carts[index]['goodsname'] = rs.goodsname
                        carts[index]['goodspic'] = rs.goodspic
                        carts[index]['price'] = rs.price
                        carts[index]['oldNum']  =rs.num
                    })
                })

                setTimeout(()=>{
                    resolve(carts)
                },200)
            }).then((carts)=>{
                    res.writeHead(200,{"Content-Type":"application/json"})

                    res.write(JSON.stringify(carts))

                    res.end()
            })



            // res.send(types)

        })
    })



})

//更改购物车状态接口
app.get('/wxapiChangeChecked',function(req,res){
    let  _id = ObjectId(req.query.id);  // 获取购物车id，用来作为修改的条件
    let  checked = req.query.checked;  //获取修改之后的状态值
    //执行修改
    MongoClient.connect(DBurl,function(err,db){
        db.collection('cart').updateOne({
            _id
        },{
            $set:{
                checked
            }
        },function(e,r){
            res.writeHead(200,{"Content-Type":"application/json"})

            res.write(JSON.stringify(r))

            res.end()
        })
    })


})


//更改购物车状态接口
app.get('/wxapiChangeAllChecked',function(req,res){

    let  username = req.query.username;  //获取修改之后的状态值
    let  checked = req.query.checked;  //获取修改之后的状态值
    //执行修改
    MongoClient.connect(DBurl,function(err,db){
        db.collection('cart').updateMany({
            username
        },{
            $set:{
                checked
            }
        },function(e,r){
            res.writeHead(200,{"Content-Type":"application/json"})

            res.write(JSON.stringify(r))

            res.end()
        })
    })


})

app.get('/wxapiChangeNum',function(req,res){
    let  _id = ObjectId(req.query.id) //条件id
    let  num = req.query.num;// 修改之后的数量

    // console.log(_id,num)
    MongoClient.connect(DBurl,function(err,db){
        db.collection('cart').updateOne({
            _id
        },{
            $set:{
               num
            }
        },function(e,r){
            res.writeHead(200,{"Content-Type":"application/json"})

            res.write(JSON.stringify(r))

            res.end()
        })
    })

})

app.get('/wxapiInsertOrder',function(req,res){

    let  username = req.query.username;// 收件人
    let  phone = req.query.phone;// 联系方式
    let  address = req.query.newaddress;// 收件地址
    let  total = req.query.total;// 总价
    let  user = req.query.nickName;// 购买人
    let status = "1"  // 新订单

    // console.log(_id,num)
    MongoClient.connect(DBurl,function(err,db){
       db.collection('order').insertOne({
           username,phone,address,total,user,status
       },function(e,r){

           // 修改商品表中的库存  ()
           // rs 就是当前购物车中所有被选中的购买下单的商品信息
           db.collection('cart').find({
               username:user,
               checked:"1"
           }).toArray(function(es,rs){
                    // rs
               rs.forEach((v,k)=>{

                   //原来的数量

                   // v.num   购买的数量 num -2
                   db.collection('goods').findOne({
                       _id:ObjectId(v.goodsid)
                   },function(a,b){
                        //  b.num  原来的库存

                       db.collection('goods').updateOne({
                            _id:ObjectId(v.goodsid)
                       },{
                            $set:{
                                num:b.num -v.num
                            }
                       },function (ess,rss) {
                            // rss 是真的，就是修改成功
                            //所有的商品都修改完毕之后，在执行删除cart操作
                           if(k  >=  rs.length-1){
                               // console.log()
                               db.collection('cart').removeMany({
                                   username:user,
                                   checked:"1"
                               },function(as,bs){
                                   res.writeHead(200,{"Content-Type":"application/json"})

                                   res.write(JSON.stringify(bs))

                                   res.end()
                               })
                           }



                       })
                   })

               })

           })

            //订单插入成功之后， 清除购物车信息






           // x需要根据订单id，将所有购买的商品插入订单详情表（忽略）
       })
    })

})

// 获取指定用户订单的方法
app.get('/wxapiGetUserOrders',function(req,res){
      let  user = req.query.nickName;// 获取购买人信息

    MongoClient.connect(DBurl,function(err,db){
        db.collection('order').find({
            user
        }).toArray(function(e,orders){
            res.writeHead(200,{"Content-Type":"application/json"})

            res.write(JSON.stringify(orders))

            res.end()
        })
    })

})

app.get('/wxapiChangeOrderStatus',function(req,res){
    let  _id = ObjectId(req.query.id);// 获取id
    let  status = req.query.status;// 获取status

    MongoClient.connect(DBurl,function(err,db){
        db.collection('order').updateOne({
            _id
        },{
            $set:{
                status
            }
        },function(e,r){
            res.writeHead(200,{"Content-Type":"application/json"})

            res.write(JSON.stringify(r))

            res.end()

        })
    })

})

//1-4监听
app.listen(3001,"127.0.0.1")
