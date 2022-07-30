#include <iostream>
#include <string>
#include <fstream>
#include <sstream>

std::string urlDecode(std::string text)
{
  std::string escaped;

  for (auto i = text.begin(), nd = text.end(); i < nd; ++i)
  {
    auto c = (*i);

    switch (c)
    {
      case '%':
        if (i[1] && i[2])
        {
          char hs[]{i[1], i[2]};
          escaped += static_cast<char>(strtol(hs, nullptr, 16));
          i += 2;
        }
        break;
      case '+':
        escaped += ' ';
        break;
      default:
        escaped += c;
    }
  }

  return escaped;
}

void runCLI() {
  int a = 87;
  while(a != 999) {
    std::string uri_encoded;
    std::getline(std::cin, uri_encoded);
    if(uri_encoded == "999") {
      a = stoi(uri_encoded);
      std::cout << "Quitting" << std::endl;
      break;
    }
    std::cout << urlDecode(uri_encoded) << std::endl;
  }
}

void runFile() {
  std::ifstream inFile("encoded.txt");
  if(!inFile.good()) return;
  std::ofstream outFile("decoded.txt");

  std::ostringstream oss;
  std::string line;
  while(getline(inFile, line)) {
    oss << line << std::endl;
  }
  std::string uri_encoded = oss.str();
  outFile << urlDecode(uri_encoded);

  inFile.close();
  outFile.close();
}

int main() {
  
  runFile();
  return 0;
}