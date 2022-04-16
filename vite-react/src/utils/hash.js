self.importScripts("/spark-md5.min.js");

// 通过FileReader读取每一个切片加入到spark，每计算完一个切片向主线程发送一个事件，全部完成后将hash发送给主线程
self.onmessage = e => {
  const { fileChunkList } = e.data;
  const spark = new self.SparkMD5.ArrayBuffer();

  let percentage = 0;
  let count = 0;
  // 递归计算每一个切片
  const next = index => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(fileChunkList[index].file);
    reader.onload = e => {
      spark.append(e.target.result);
      count++;
      if (count === fileChunkList.length) {
        self.postMessage({
          percentage: 100,
          hash: spark.end(),
        });
      } else {
        percentage += 100 / fileChunkList.length;
        self.postMessage({
          percentage,
        });
        next(index++);
      }
    };
  };

  next(0);
};
