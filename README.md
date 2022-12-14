Welcome to dis.web; an interpreter for Dis language implemented with HTML+JavaScript!

# Purpose of implementation
To make it easier to demonstrate how a Dis program works. I hope you are here for code golf.

# Features of the implementation
- Source of program can be written in UTF-8, although US-ASCII is enough for minimal requirement. 
- Syntax is as in original design.
- Input for program can be represented as either UTF-8 string or base64 string or base16 string: as octet sequence.
- Output can be represented as either UTF-8 or base64 or base16: as octet sequence.
- Input and output are done in octet unit, as seen in original implementation (when you compile the interpreter in modern environment, where a byte is an octet).
  - When input, 59048 is set to register A when EOF, and one of range 0 to 255 is set when the interpreter recieves a byte.
  - When output, trying to output 59048 terminates the program. Otherwise, when you try to output a value larger than 255, the value is divided by 256 first, then the modulus of the result is output as an octet.
- You can share the direct link to a program with input.

# References: Resource for Dis language
1. [Mirror of the Dis '98 specification including original interpreter](https://mirrors.talideon.com/articles/malbolge/dis.html)
2. [Article on Esolang: the esoteric programming language wiki](https://esolangs.org/wiki/Dis)

# License
dis.web is distributed under the GNU AGPL v3.0, and this documentation is distributed under the GNU FDL v1.0.

This program and the documentation are written by Tpaefawzen.
