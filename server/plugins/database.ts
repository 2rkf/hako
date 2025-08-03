import mongoose from "mongoose";

export default defineNitroPlugin(async () => {
    const config = useRuntimeConfig();
    mongoose.set("strictQuery", false);

    await mongoose.connect(config.Mongo, {
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
    })
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error(err));
});
