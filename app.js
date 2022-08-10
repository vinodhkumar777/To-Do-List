const express=require("express");
const bodyParser=require("body-parser");
let ejs=require("ejs");
const mongoose=require("mongoose");
const date=require(__dirname+"/date.js")//our own module so we have to use __dirname
//and it will try to execute the code inside the date.js  and store the result
//returned from the date.js file when execution comes here
//console.log(date);
const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));//telling the express to use static files in public folder
app.set("view engine","ejs");//telling the server to use ejs file at views folder
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});//(this will connect to the server  where mongoDB is hosted locally in our system)


const itemsSchema= {
    name:String
};

const Item= mongoose.model("Item",itemsSchema);//Items is a collection in DB and it will create with plural form in DB(mongo Shell)
const Hometask=mongoose.model("Hometask",itemsSchema);

const first_doc=new Item({
    name:"Wake Up"
})
const second_doc=new Item({
    name:"start working"
})

const tasks_arr=[first_doc,second_doc];//this is an array of documents
 
app.get("/",function(req,res){
//finding all the elements in my Items collection or model
    Item.find({},function(err,docs){
        if(docs.length==0){
            //push the array of documents to Item collection only for the first time
            Item.insertMany(tasks_arr,function(err){
                if(err){
                    console.log("error");
                }
                else{
                    console.log("successfully inserted");
                }
            });
            res.redirect("/");
        }            
        else{
            res.render("list",{listTitle:date,newTasks:docs});
        }
    })
    
    //rendering the list ejs file to client with the passing necessary information form the server to the ejs file as an object
    
})


app.post("/",function(req,res){
    //parsing the data with the bodyParser which comes from the post request

    const tasks=req.body;
    console.log(req.body);//see this for more details
    let task=tasks.task;
   
    if(tasks.list=="Home"){//for task coming from home route using name at button which comes from req.body object
        const item=new Hometask({//creating a document for Item model
            name:task
        })
        item.save();//will insert this element
        res.redirect("/home");
    }
    else{
     const item=new Item({//creating a document from Hometask model
        name:task
     })//this is for task coming from route route
     item.save();//will insert this element 
     res.redirect("/")//this will do same task as making an get request ti home route
    } 
   
})

app.post("/delete",function(req,res){
    const checked=req.body;
    //console.log(checked);
    const check_item=checked.is_checked;
    const prio=checked.priority;
    console.log(check_item,prio);

    if(!prio){
    Item.exists({ _id: check_item },function(err,ans){
    if(ans){
        Item.deleteOne({_id:check_item},function(err){
            if(err){
                console.log("error occured");
            }
            else{
                console.log("successfully deleted");
            }
        });
        res.redirect("/");
    }
    else{
        Hometask.deleteOne({_id:check_item},function(err){
            if(err){
                console.log("error");
            }
            else{
                console.log("successfully deleted from Home collection");
            }
        })
        res.redirect("/home")
    } });
    }
    else{
        Item.exists({name:prio},function(err,ans){
            if(ans){
                Item.find({},function(err1,docs){
                    if(err1){
                        console.log("error occured");
                    }
                    else{
                        //docs is an array of documents getting from mongoDB database
                        let arr=[];
                        let item;
                       // console.log(docs);
                        for(let i=0;i<docs.length;i++){
                           // console.log(docs[i]._id)
                            if(docs[i].name!==prio){
                                arr.push({name:docs[i].name});
                               // console.log(docs[i]._id)
                            }
                            else item=docs[i].name;
                        }
                        console.log(item);
                        arr.unshift({name:item});
                        Item.deleteMany({},function(err){
                            if(err){
                                console.log("error");
                            }
                            else{
                                console.log("successfully deleted all the items");
                            }
                        })
                        Item.insertMany(arr,function(err){
                            if(err){
                                console.log("error ");
                            }
                            else{
                                console.log("successfully modified the array");
                            }
                        })
                        res.redirect("/");
                        
                    }
                })
            }
            else{
                Hometask.find({},function(err,docs){
                    if(err){
                        console.log("error");
                    }
                    else{
                        //docs is an array of documents getting from mongoDB database
                        let arr=[];
                        let item;
                        for(let i=0;i<docs.length;i++){
                            if(docs[i].name!==prio){
                                arr.push({name:docs[i].name});
                            }
                            else item=docs[i].name;
                        }
                        arr.unshift({name:item});
                        Hometask.deleteMany({},function(err){
                            if(err){
                                console.log("error");
                            }
                            else{
                                console.log("successfully deleted all the items");
                            }
                        })
                        Hometask.insertMany(arr,function(err){
                            if(err){
                                console.log("error ");
                            }
                            else{
                                console.log("successfully modified the array");
                            }
                        })
                        res.redirect("/home");
                        
                    }
                })
            }
        })
    }
})


app.get("/home",function(req,res){

    Hometask.find({},function(err,docs){
        if(docs.length==0){
            Hometask.insertMany(tasks_arr,function(err){
                if(err){
                    console.log("error");
                }
                else{
                    console.log("successfully inserted");
                }
            });
            res.redirect("/home"); 
        }
        else{
            res.render("list",{listTitle:"Home",newTasks:docs})//rendring the same ejs file with different lititem for home
        }
    });  
    
})


app.listen(3000,function(req,res){
    console.log("server has started on the port 3000");
})