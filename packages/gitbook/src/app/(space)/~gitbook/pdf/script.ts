const { renderToPipeableStream } = require('react-dom/server');
const PDFHTMLOutput = require('./page');
//import  { renderToPipeableStream, renderToStaticNodeStream } from 'react-dom/server';
//import PDFHTMLOutput from './page';
//import fs from 'fs';
//import React from 'react';
const fs = require('fs');
const React = require('react');


// Create a writable stream to save the HTML to a file
const writeStream = fs.createWriteStream('output.html');

// Start the server-side rendering with renderToPipeableStream
const { pipe } = renderToPipeableStream(React.createElement(PDFHTMLOutput, {searchParams : {'a': 'b'}}) as any);

// Pipe the render stream to the writable file stream
pipe(writeStream);

// Optionally, you can handle errors and closure
writeStream.on('finish', () => {
  console.log('HTML has been written to output.html');
});

writeStream.on('error', (err: any) => {
  console.error('Error writinsg to file:', err);
});
