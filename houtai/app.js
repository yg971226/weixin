// 整个后台的入口文件

//1 express 框架操作



//1-1  导入express

let  express =   require('express');

//1-2 实例化
const   app =  new  express()


//2.使用ejs  默认的文件夹目录是 views

app.set('view engine','ejs')

//3.设置静态目录
app.use("/",express.static('static'))



//4.引入数据库
//4-1 引入
let  MongoClient =  require('mongodb').MongoClient;
let  ObjectId  =require('mongodb').ObjectId;
// 设置数据库链接地址
let  DBurl = "mongodb://127.0.0.1:27017/myshop";
//5.引入图片处理模块
var multiparty = require('multiparty');
//  当用户访问 /u0loads这个路由的时候，就能够访问当前目录下的图片
app.use('/upload',express.static('upload'))


//6.引入文件模块
let fs =  require('fs')
//1-3 设置路由

app.get('/',function(req,res){
    // res.send('express12')
    // let  name = "张三丰"
    // res.render("test",{
    //      name:name,
    //      info:[10,20,30],
    //     age:17
    // })
    //进入到项目根目录时，直接显示类别列表页面

    res.redirect('/type/index')

})
//====================商品类别管理模块========================
//1.类别的显示
app.get('/type/index',function(req,res){

    MongoClient.connect(DBurl,function(err,db){
        // 获取所有的类别
        db.collection('type').find().toArray(function(e,types){
            // console.log(r)
            res.render("type/index",{
                types
            })
        })
    })


})


//2.类别添加
app.get('/type/add',function(req,res){

    res.render("type/add",{})
})

//3.类别的执行添加
app.post('/type/doAdd',function(req,res){
        //没有页面，只有逻辑
    //1.获取到参数的值
    var form = new multiparty.Form();
    form.uploadDir = "upload"  //  设置上传文件存储目录

    form.parse(req, function(err, fields, files) {
        //  fields   正常的post传的参数

    //    files    文件上传的信息

        console.log(fields,"lalala",files)
        //获取类别名称
        let  typename = fields.typename[0];
        let typepic = files.typepic[0].path;

        //2.链接数据库，执行添加操作   2.2.33
        MongoClient.connect(DBurl,function(err,db){
            //  err  数据链接失败的报错信息
            // db  资源句柄
            if(err)  throw  err;

            //判断当前类别是否已经添加过
             db.collection('type').findOne({
                 typename
             },function(es,rs){
                    if(rs){
                            //如果rs有值，证明已经提添加过了，
                        fs.unlink(typepic,function(){})
                        res.send("<script>alert('当前类别已经存在！');history.back();</script>")
                        return false;
                    }else{
                        db.collection('type').insertOne({
                            typename,
                            typepic
                        },function(e,r){
                            // console.log(e)
                            // console.log(r)
                            //判断当前是否有图片
                            if(files.typepic[0].size == 0){
                                //证明是没有图片上传的
                                fs.unlink(typepic,function(){})
                            }

                            if(r.insertedId){
                                // 插入成功，返回的插入id
                                //也得删除图片（）

                                res.send("<script>alert('商品类别插入成功！');location.href='/type/index';</script>")
                            }else{
                                // 如果类别添加失败， 图片应该删除掉
                                fs.unlink(typepic,function(){})
                                res.send("<script>alert('商品类别插入失败！');location.href='/type/index';</script>")
                            }
                        })
                    }
             })



        })

    });


})


//4.类别的删除
app.get('/type/doDel',function(req,res){
    // 接受参数
    // console.log(req.query)
    //处理id，将id变成 ObjectId(id)
    let  _id = ObjectId(req.query.id);





    let  typepic = req.query.typepic;
    MongoClient.connect(DBurl,function(err,db){
        // 在删除类别之前，需要判断一下当前类别下是否有商品，如果有商品，那么不能删除
        db.collection('goods').findOne({
            typeid:req.query.id
        },function(errs,ress){
            if(ress){
                //证明有商品，不能删除
                res.send("<script>alert('当前类别下有商品，暂时不能删除！请先处理商品！！');location.href='/type/index';</script>")
            }else{
                // 根据指定条件删除类别
                db.collection('type').removeOne({_id},function(e,r){
                    // console.log(e,'23456789',r)
                    if(r.deletedCount){
                        //证明删除成功

                        //删除图片
                        fs.unlink(typepic,function(){})
                        res.send("<script>alert('商品类别删除成功！');location.href='/type/index';</script>")
                    }else{
                        //删除失败
                        res.send("<script>alert('商品类别删除失败！');location.href='/type/index';</script>")
                    }
                })
            }
        })


    })


})

//5.类别修改
app.get('/type/edit',function(req,res){
    //处理id，将id变成 ObjectId(id)
    let  _id = ObjectId(req.query.id);
    MongoClient.connect(DBurl,function(err,db){
        // 获取所有的类别
        db.collection('type').findOne({_id},function(e,r){
            // console.log(r,1234567890)
            res.render("type/edit",{
                type:r
            })
        })
    })


})

//6.执行类别修改
app.post("/type/doEdit",function(req,res){
    //
    var form = new multiparty.Form();
    form.uploadDir = "upload"  //  设置上传文件存储目录

    form.parse(req, function(err, fields, files) {
        //获取类别名称
        let  typename = fields.typename[0];  //  修改之后的名字
        let typepic = files.typepic[0].path; //  如果有上传图片，（新的图片路径） 、如果没有，（垃圾信息）
        // console.log(fields,888)
        //获取id
        let _id = ObjectId(fields.id[0])   //  id
        let oldPic = fields.oldPic[0]  //老的图片名称

        MongoClient.connect(DBurl,function(err,db){
            //直接判断是否有新的上传图片
            let  update = {}
            if(files.typepic[0].size){
                //有新的上传图片
                // db.collection('type').updateOne({_id},{
                //     $set:{
                //         typename,
                //         typepic
                //     }
                // },function(e,r){
                //     if (r.modifiedCount){
                //         //修改成功
                //         if(oldPic){
                //             fs.unlink(oldPic,function(){})
                //         }
                //         res.send("<script>alert('商品类别修改成功！');location.href='/type/index';</script>")
                //     } else{
                //         //修改失败
                //         fs.unlink(typepic,function(){})
                //         res.send("<script>alert('商品类别修改失败！');history.back();</script>")
                //     }
                // })

                update ={
                    $set:{
                        typename,
                        typepic
                    }
                }

            }else{
                //没有新的上传图片
                // fs.unlink(typepic,function(){}) // 没有新的上传图片，那么需要删除垃圾信息
                // db.collection('type').updateOne({_id},{$set:{
                //         typename
                //     }
                // },function(e,r){
                //     // console.log(r)
                //     if (r.modifiedCount){
                //         res.send("<script>alert('商品类别修改成功！');location.href='/type/index';</script>")
                //     } else{
                //         res.send("<script>alert('商品类别修改失败！');history.back();</script>")
                //     }
                // })
                 update ={
                    $set:{
                        typename,

                    }
                }
            }


            db.collection('type').updateOne({_id},update,function(e,r){
                // console.log(r)
                if(files.typepic[0].size){
                    //有
                    if (r.modifiedCount){
                        if(oldPic){
                                        fs.unlink(oldPic,function(){})
                                    }
                        res.send("<script>alert('商品类别修改成功！');location.href='/type/index';</script>")
                    } else{
                        fs.unlink(typepic,function(){})
                        res.send("<script>alert('商品类别修改失败！');history.back();</script>")
                    }
                }else{
                    //没有
                    fs.unlink(typepic,function(){})
                    if (r.modifiedCount){
                        res.send("<script>alert('商品类别修改成功！');location.href='/type/index';</script>")
                    } else{
                        res.send("<script>alert('商品类别修改失败！');history.back();</script>")
                    }
                }

            })



        })


    });

})


// ==============商品管理============

//商品显示页面
app.get('/goods/index',function(req,res){

        //获取商品信息
    MongoClient.connect(DBurl,function(err,db){
        // 获取所有的类别
        db.collection('goods').find().toArray(function(e,goods){
            // console.log(r)

            // 根据当前商品的类别id，去type表中获取对应的类别名称
            // item.typeid  就是type表中id
            new Promise(function(resolve,reject){
                goods.forEach((item,index)=>{
                    db.collection('type').findOne({_id:ObjectId(item.typeid)},function(er,rs){
                        // console.log(rs)  临时添加一个属性 typename
                        goods[index].typename = rs.typename;

                    })

                })
                setTimeout(()=>{
                    resolve(goods)
                },100)

            }).then((goods)=>{
                // console.log(goods)

                res.render("goods/index",{
                    goods
                })
            })


        })
    })

        // res.send('index')
})



//商品添加页面
app.get('/goods/add',function(req,res){
    // res.send('add')
    //  获取所有的商品类别
    MongoClient.connect(DBurl,function(err,db){
        db.collection('type').find().toArray(function(e,r){
            // console.log(r,1234567890)
            res.render("goods/add",{
                type:r //  将获取到的类别渲染到add模板中
            })
        })
    })


})


//执行商品添加操作
app.post('/goods/doAdd',function(req,res){
    //没有页面，只有逻辑
    //1.获取到参数的值
    var form = new multiparty.Form();
    form.uploadDir = "upload"  //  设置上传文件存储目录

    form.parse(req, function(err, fields, files) {

        //获取商品信息  6
        let  goodsname = fields.goodsname[0];
        let  typeid = fields.typeid[0];
        let  status = fields.status[0];
        let  price = fields.price[0];
        let  num = fields.num[0];
        let  desc = fields.desc[0];

        // 商品图片  1
        let goodspic = files.goodspic[0].path;

        //2.链接数据库，执行添加操作   2.2.33
        MongoClient.connect(DBurl,function(err,db){
            //  err  数据链接失败的报错信息
            // db  资源句柄
            if(err)  throw  err;

            //判断当前类别是否已经添加过
            db.collection('goods').findOne({
                goodsname
            },function(es,rs){
                if(rs){
                    //如果rs有值，证明已经提添加过了，
                    fs.unlink(goodspic,function(){})
                    res.send("<script>alert('当前商品已经存在！');history.back();</script>")
                    return false;
                }else{
                    db.collection('goods').insertOne({
                        goodsname,goodspic,price,num,status,desc,typeid
                    },function(e,r){

                        //判断当前是否有图片
                        if(files.goodspic[0].size == 0){
                            //证明是没有图片上传的
                            fs.unlink(typepic,function(){})
                        }

                        if(r.insertedId){
                            // 插入成功，返回的插入id
                            res.send("<script>alert('商品插入成功！');location.href='/goods/index';</script>")
                        }else{
                            // 如果类别添加失败， 图片应该删除掉
                            fs.unlink(goodspic,function(){})
                            res.send("<script>alert('商品插入失败！');location.href='/goods/index';</script>")
                        }
                    })
                }
            })



        })

    });


})

//删除
app.get('/goods/doDel',function(req,res){
    //处理id，将id变成 ObjectId(id)
    let  _id = ObjectId(req.query.id);

    let  goodspic = req.query.goodspic;


    MongoClient.connect(DBurl,function(err,db){
        // 获取所有的类别
        db.collection('goods').removeOne({_id},function(e,r){
            // console.log(e,'23456789',r)
            if(r.deletedCount){
                //证明删除成功

                //删除图片
                fs.unlink(goodspic,function(){})
                res.send("<script>alert('商品删除成功！');location.href='/goods/index';</script>")
            }else{
                //删除失败
                res.send("<script>alert('商品删除失败！');location.href='/goods/index';</script>")
            }
        })
    })
})

//加载商品修改操作
app.get('/goods/edit',function(req,res){
    //获取商品id
    let  _id = ObjectId(req.query.id);

    MongoClient.connect(DBurl,function(err,db){
        // 获取所有的类别
        db.collection('goods').findOne({_id},function(e,goods){
            // console.log(r,1234567890)

            //获取所有的类别
            db.collection('type').find().toArray(function(es,types){
                // console.log(r,1234567890)
                res.render("goods/edit",{
                    types, //  将获取到的类别渲染到add模板中
                    goods //  将要修改的数据
                })
            })
            // res.render("goods/edit",{
            //     goods:r
            // })
        })
    })

    // res.render("goods/edit",{})
})

//执行修改
app.post('/goods/doEdit',function(req,res){
    var form = new multiparty.Form();
    form.uploadDir = "upload"  //  设置上传文件存储目录

    form.parse(req, function(err, fields, files) {
        //获取商品信息

        let  goodsname = fields.goodsname[0];
        let  typeid = fields.typeid[0];
        let  status = fields.status[0];
        let  price = fields.price[0];
        let  num = fields.num[0];
        let  desc = fields.desc[0];

        // 商品图片  1
        let goodspic = files.goodspic[0].path;

        //获取id
        let _id = ObjectId(fields.id[0])   //  条件id
        let oldPic = fields.oldPic[0]  //老的图片名称

        MongoClient.connect(DBurl,function(err,db){
            //直接判断是否有新的上传图片
            if(files.goodspic[0].size){
                //有新的上传图片
                db.collection('goods').updateOne({_id},{
                    $set:{
                        goodsname,price,num,status,desc,typeid,goodspic
                    }
                },function(e,r){
                    if (r.modifiedCount){
                        //修改成功
                        if(oldPic){
                            fs.unlink(oldPic,function(){})
                        }
                        res.send("<script>alert('商品修改成功！');location.href='/goods/index';</script>")
                    } else{
                        //修改失败
                        fs.unlink(goodspic,function(){})
                        res.send("<script>alert('商品修改失败！');history.back();</script>")
                    }
                })



            }else{
                //没有新的上传图片
                fs.unlink(goodspic,function(){}) // 没有新的上传图片，那么需要删除垃圾信息
                db.collection('goods').updateOne({_id},{$set:{
                        goodsname,price,num,status,desc,typeid
                    }
                },function(e,r){
                    // console.log(r)
                    if (r.modifiedCount){
                        res.send("<script>alert('商品修改成功！');location.href='/goods/index';</script>")
                    } else{
                        res.send("<script>alert('商品修改失败！');history.back();</script>")
                    }
                })

            }

        })


    });
})

//===============购物车管理模块================
app.get('/cart/index',function(req,res){
    //链接数据库
    MongoClient.connect(DBurl,function(err,db){
        db.collection('cart').find({}).toArray(function(e,carts){
            // console.log(carts)
            if(carts.length){
                carts.forEach((item,index)=>{
                    // console.log(123)
                    db.collection('goods').findOne({
                        _id:ObjectId(item.goodsid)
                    },function(er,rs){
                        carts[index]['goodsname'] = rs.goodsname
                        carts[index]['goodspic'] = rs.goodspic
                        carts[index]['price'] = rs.price

                        // console.log(carts[index])
                        if(index >= carts.length-1){
                            res.render('cart/index',{
                                carts
                            })
                        }

                    })



                })
            }else{
                res.render('cart/index',{
                    carts
                })
            }




        })
    })

})

//==================订单管理模块===========================
app.get('/order/index',function(req,res){

    MongoClient.connect(DBurl,function(err,db){
        db.collection('order').find({}).toArray(function(e,orders){

            res.render('order/index',{
                orders
            })
        })
    })

})

app.get('/order/doEdit',function(req,res){
    let  status =  req.query.status;
    let  id =  ObjectId(req.query.id)

    if(status == 1){
            // 将状态1 变成2
        status = "2"
    }else if(status ==  2){
        res.send("<script>alert('等待用户收货！！！');history.back();</script>")
        return false;
    }else{
        res.send("<script>alert('当前订单已经完成！！！');history.back();</script>")
        return false;
    }
    MongoClient.connect(DBurl,function(err,db){
        db.collection('order').updateOne({
            _id:id
        },{
            $set:{
                status
            }
        },function(e,r){
                res.redirect('/order/index')
        })
    })

})
//1-4监听
app.listen(3000,"127.0.0.1")
