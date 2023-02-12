const getBlobFromUrl = async (myImageUrl: string) => {
    const res = await fetch(myImageUrl)
    const data = await res.blob()
    let metadata = {
        type: data.type || 'image/jpeg',

    };
    let fileName
    try {
        fileName = myImageUrl.split('/').slice(-1)[0]
    } catch {
        fileName = 'tset.jpg'
    }
    return new File([data], fileName, metadata);
}


const convertUrlToImageData = async (myImageUrl: string) => {
    return await getBlobFromUrl(myImageUrl);
}

export default convertUrlToImageData;
