import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import { User } from "./user.model";
const videoSchema=new mongoose.Schema({
videoFile:{
    type:String,//Cloudionary Url
    required:true
},
thumbNail:{
    type:String, //cloudionary url
    required:true
},
title:{
type:String,
required:true
},
description:{
    type:String,
    required:true
},
duration:{
    type:Number,
    required:true
},
views:{
    type:Number,
     default:0
},
isPublished:{
    type:Boolean,
    default:true
},
owner:{
    type:Schema.type.ObjectId,
    ref:User
}

},{timeStamps:true});
videoSchema.plugin(mongooseAggregatePaginate);
export const Video=mongoose.model('Video',videoSchema);