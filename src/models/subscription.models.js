import mongoose, {Schema} from "mongoose";

// ss->subscriptionSchema
// s=Subscription
const ss=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const s = mongoose.model("Subscription",
    ss
)