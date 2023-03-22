import { Box, Button, Stack, TextField, Typography } from "@mui/material"
import React from "react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";


const FormInput = forwardRef((props, ref) => {


    const [currentTitle, setCurrentTitle] = useState("");
    const [currentRecorder, setCurrentRecorder] = useState("");
    const [currentFile, setCurrentFile] = useState<File>();

    useImperativeHandle(ref, ()=>({
        getFormInput: ()=>{
            return {title: currentTitle, recorder: currentRecorder, file: currentFile};
        },
    }));

    function handleFileChange(event: React.FormEvent<HTMLInputElement>) {
        event.preventDefault();
        setCurrentFile((event.currentTarget.files ?? [])[0]);
    }

    return (
        <>
        <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" component="label">
                Upload Audio
                <input
                    id="audioFileInput"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    hidden />
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>{currentFile?.name}</Typography>
            </Box>
        </Stack><TextField id="title" variant="standard" label="Title" onChange={(event) => {
            setCurrentTitle(event.currentTarget.value)
        } }></TextField><TextField id="recorder" variant="standard" label="Recorder" onChange={(event) => {
            setCurrentRecorder(event.currentTarget.value)
        } }></TextField>
        </>
    )
})
FormInput.displayName = "FormInput";
export default React.memo(FormInput);