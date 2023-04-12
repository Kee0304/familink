import { configureStore } from "@reduxjs/toolkit";
import tokenReducer from './Auth';
import rootReducer from "../modules";

export default configureStore({
    reducer: {
        authToken: tokenReducer,
        index: rootReducer,
    },
})
