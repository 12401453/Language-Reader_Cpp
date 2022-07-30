#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <iomanip>

bool Convert(const char *sourceFile, const char *targetFile)
{

    std::ifstream inFile(sourceFile, std::ifstream::binary);
    std::ofstream outFile(targetFile);
    if(inFile.good() && outFile.good()) {
        std::stringstream iss;
        char line[1];
        while(inFile.read(line, 1)) {
         //   outFile << "\\x" << std::hex << std::setfill('0') << std::setw(2) << (short)line[0];
            outFile << std::hex << std::setfill('0') << std::setw(2) << (short)line[0] << " ";
         //   std::cout << "0x" << std::hex << std::setfill('0') << std::setw(2) << (short)line[0];
        }
       
        inFile.close();
        outFile.close();
        return true;
    }
    else {
        return false;
    }
}

int main() {
    std::string sourceFile, targetFile;

    std::cout << "Source HTML filename: ";
    std::getline(std::cin, sourceFile);
    std::cout << "Destination filename: ";
    std::getline(std::cin, targetFile);

    if(Convert(sourceFile.c_str(), targetFile.c_str())) {
        std::cout << std::endl << "Hex generated successfully" << std::endl;
        return 0;
    }
    else {
        std::cout << "Error" << std::endl;
        return 0;
    }
}
