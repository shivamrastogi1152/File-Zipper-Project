import { HuffmanCoder } from './huffman.js';


onload = function () {
    
    const treearea = document.getElementById('treearea');
    const encode = document.getElementById('encode');
    const decode = document.getElementById('decode');
    const temptext = document.getElementById('temptext');
    const upload = document.getElementById('uploadedFile');

    const coder = new HuffmanCoder();

    upload.addEventListener('change',()=>{ alert("File uploaded") });

    encode.onclick = function () {

        const uploadedFile = upload.files[0];
        if(uploadedFile===undefined){
            alert("No file uploaded !");
            return;
        }
        const fileReader = new FileReader();

        ///filereader.onload event is triggered
        ///when reading operation is successfully conferted: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
        fileReader.readAsText(uploadedFile, "UTF-8");
        fileReader.onload = function(fileLoadedEvent)
        {   
            const text = fileLoadedEvent.target.result;
            if(text.length===0)
            {
                alert("Text can not be empty ! Upload another file !");
                return;
            }

            let [encoded, tree_structure, info] = coder.encode(text);
            downloadFile(uploadedFile.name.split('.')[0] +'_encoded.txt', encoded);
            treearea.innerText = tree_structure;
            treearea.style.marginTop = '1500px';
            temptext.innerText = info;
        };
        
    };

    decode.onclick = function () {

        const uploadedFile = upload.files[0];
        if(uploadedFile===undefined){
            alert("No file uploaded !");
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent){
            const text = fileLoadedEvent.target.result;
            if(text.length===0){
                alert("Text can not be empty ! Upload another file !");
                return;
            }
            let [decoded, tree_structure, info] = coder.decode(text);
            downloadFile(uploadedFile.name.split('.')[0] +'_decoded.txt', decoded);
            treearea.innerText = tree_structure;
            treearea.style.marginTop = '200px';
            temptext.innerText = info;
        };
        fileReader.readAsText(uploadedFile, "UTF-8");
    };

};

function downloadFile(fileName, data){
    let a = document.createElement('a');
    a.href = "data:application/octet-stream,"+encodeURIComponent(data);
    a.download = fileName;
    a.click();
}