'''
    Created by Elijah Sawyers on 03/07/19.

    Abstract:
    This file contains the functionality for converting a pdf to png and
    doing coordinates conversions between the two.
'''

from wand.image import Image

'''This class can convert pdf files into png files.'''
class PDFConverter: 

    # Initialize the PDF converter.
    def __init__(self, pdfFilePath):
        self.pdfFile = Image(filename=pdfFilePath)

    # Converts a pdf file into a png file.
    def convertToPng(self, newFilePath):
        with self.pdfFile as pdfToConvert:
            # Convert to png.
            with pdfToConvert.convert("png") as convertedPdf:
                convertedPdf.save(filename=newFilePath)

# For testing purposes.
if __name__ == "__main__":
    pdfConverter = PDFConverter("static/pdfs/test.pdf")
    pdfConverter.convertToPng("static/pngs/test.png")
