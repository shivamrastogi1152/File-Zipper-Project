import { BinaryHeap } from './heap.js';
export { HuffmanCoder }

class HuffmanCoder{

    display(node, modify, index=1)
    {

        ///During Compression Node-> [freq,[left,right]] OR [freq,char] as internal,leaf node respectively
        ///During Decompression Node -> [left,right] OR [char] as internal,leaf node respectively
        ///So while decompressing we send flag variable as true and convert decompression node into compression node

        if(modify){
            node = ['',node];
            if(node[1].length===1)
                node[1] = node[1][0];
        }

        if(typeof(node[1])==="string"){
            return String(index) + " = " + node[1];
        }

        let left = this.display(node[1][0], modify, index*2);
        let right = this.display(node[1][1], modify, index*2+1);
        let res = String(index*2)+" <= "+index+" => "+String(index*2+1);
        return res + '\n' + left + '\n' + right;
    }

    stringify(node){

        ///Leaf Node
        if(typeof(node[1])==="string")
        {   
            ///How to distinguish between a character and path info???
            return '\''+node[1];
        }

        return '0' + this.stringify(node[1][0]) + '1' + this.stringify(node[1][1]);
    }

    destringify(data){
        let node = [];

        ///Leaf node
        if(data[this.ind]==='\''){
            this.ind++;
            node.push(data[this.ind]);
            this.ind++;
            return node;
        }

        ///Internal node
        this.ind++;
        let left = this.destringify(data);
        node.push(left);
        this.ind++;
        let right = this.destringify(data);
        node.push(right);

        return node;
    }

    getMappings(node, path){

        ///If current node is a leaf node then map the value '
        ///of character to the Binary string that is created through the recursion calls
        if(typeof(node[1])==="string")
        {
            this.mappings[node[1]] = path;
            return;
        }

        ///Left is denoted by 0 and Right is denoted by 1
        this.getMappings(node[1][0], path+"0");
        this.getMappings(node[1][1], path+"1");
    }

    encode(data){
        
        //Get a new heap
        this.heap = new BinaryHeap();

        //Store the frequency of each character in a map
        const mp = new Map();
        for(let i=0;i<data.length;i++){
            if(data[i] in mp)
            {
                mp[data[i]] = mp[data[i]] + 1;
            } 
            else
            {
                mp[data[i]] = 1;
            }
        }
        
        ///The heap stores [-freq,char] as this.heap is actually max heap
        for(const key in mp){
            this.heap.insert([-mp[key], key]);
        }

        ///Create the huffmann tree
        while(this.heap.size() > 1){
            const node1 = this.heap.extractMax();
            const node2 = this.heap.extractMax();

            const node = [node1[0]+node2[0],[node1,node2]];
            this.heap.insert(node);
        }
        
        ///Extracting the huffman tree
        ///Leaf nodes will be of type [-freq,char] and 
        ///internal nodes will be of type: [-(Left_freq+Right_freq),[left,child]];
        const huffman_encoder = this.heap.extractMax();

        ///Get character to binary string mappings 
        this.mappings = {};
        this.getMappings(huffman_encoder, "");

        ///Create the encoded binary string
        let binary_string = "";
        for(let i=0;i<data.length;i++) 
        {
            binary_string = binary_string + this.mappings[data[i]];
        }
        

        ///Add some zeros to make binary string length as multiple of 8 
        ///Each bucket of size 8 will be mapped to some ASCII character
        let rem = (8 - binary_string.length%8)%8;
        let padding = "";
        for(let i=0;i<rem;i++)
            { padding = padding + "0";}

        binary_string = binary_string + padding;

        ///For each bucket of size 8, assign ASCII character to it 
        let result = "";
        for(let i=0;i<binary_string.length;i+=8)
        {   
            ///Num will represent the ASCII value of character
            let num = 0;
            for(let j=0;j<8;j++)
            {
                num = num*2 + (binary_string[i+j]-"0");
            }
            ///Result will containt final encoded string i.e. characters encoded into characters!!!
            result = result + String.fromCharCode(num);
        }

        ///Concatenate the required info to decode the encoded result
        ///For decoding the result we require Huffman Tree, number of padded zeroes and encoded string
        let final_res = this.stringify(huffman_encoder) + '\n' + rem + '\n' + result;
        let info = "Compression complete and file sent for download" + '\n' + "Compression Ratio : " + (data.length/final_res.length);

        ///Return encoded data, tree structure,additional info
        return [final_res, this.display(huffman_encoder, false), info];
    }

    decode(data){

        ///To retrieve stringified huffmann tree, rem (padding no.),encoded string
        data = data.split('\n');

        if(data.length===4)
        {
            // Handling new line in Huffman tree
            data[0] = data[0] + '\n' + data[1];
            data[1] = data[2];
            data[2] = data[3];
            ///Remove data[3] as it is stored in data 2 now, data 2 is stored in data 1 and so on 
            data.pop();
        }

        this.ind = 0;

        ///Retrieve Huffmann Tree from Stringified Huffman tree
        const huffman_decoder = this.destringify(data[0]);

        ///Text represents encoded text
        const text = data[2];

        ///Encoded text to binary string 
        let binary_string = "";
        for(let i=0;i<text.length;i++)
        {
            ///Num will store ASCII code of each character
            let num = text[i].charCodeAt(0);

            let bin = "";
            ///Convert the ASCII code into it's binary representation and store in bin
            for(let j=0;j<8;j++){
                bin = num%2 + bin;
                num = Math.floor(num/2);
            }
            binary_string = binary_string + bin;
        }

        ///Remove the padded zeroes to create final binary string 
        binary_string = binary_string.substring(0,binary_string.length-data[1]);
        // console.log(binary_string.length);

        ///Convert binary string to Original text
        let res = "";
        let node = huffman_decoder;
        for(let i=0;i<binary_string.length;i++){
            if(binary_string[i]==='0'){
                node = node[0];
            } else{
                node = node[1];
            }

            if(typeof(node[0])==="string"){
                res += node[0];
                node = huffman_decoder;
            }
        }
        let info = "Decompression complete and file sent for download";

        ///Return decoded text,tree structure,and additional info
        return [res, this.display(huffman_decoder, true), info];
    }
}