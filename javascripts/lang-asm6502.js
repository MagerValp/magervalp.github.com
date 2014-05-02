// Contributed by MagerValp at gmail dot com

/**
 * @fileoverview
 * Registers a language handler for 6502 assembly code.
 *
 * To use, include prettify.js and this file in your HTML page.
 * Then put your code in an HTML tag like
 *      <pre class="prettyprint lang-asm6502">(my 6502 code)</pre>
 *
 * @author MagerValp at gmail dot com
 */

PR.registerLangHandler(
    PR.createSimpleLexer(
        [ // shortcutStylePatterns
          // "single-line-string"
          [PR.PR_STRING,        /^(?:"(?:[^\\"\r\n]|\\.)*(?:"|$))/, null, '"'],
          [PR.PR_STRING,        /^(?:'(?:[^\\'\r\n]|\\.)*(?:'|$))/, null, "'"],
          // Whitespace
          [PR.PR_PLAIN,         /^\s+/, null, ' \r\n\t\xA0']
        ],
        [ // fallthroughStylePatterns
          [PR.PR_COMMENT,       /^;[^\r\n]*/, null],
          [PR.PR_KEYWORD,       /^\b(?:ADC|AND|ASL|BCC|BCS|BEQ|BIT|BMI|BNE|BPL|BRK|BVC|BVS|CLC|CLD|CLI|CLV|CMP|CPX|CPY|DEC|DEX|DEY|EOR|INC|INX|INY|JMP|JSR|LDA|LDX|LDY|LSR|NOP|ORA|PHA|PHP|PLA|PLP|ROL|ROR|RTI|RTS|SBC|SEC|SED|SEI|STA|STX|STY|TAX|TAY|TSX|TXA|TXS|TYA)\b/i, null],
          //[PR.PR_PLAIN,         /^[A-Z][A-Z0-9]?(?:\$|%)?/i, null],
          // Literals .0, 0, 0.0 0E13
          [PR.PR_LITERAL,       /^(?:\$[0-9a-f]+|(?:\d+))/i,  null, '0123456789'],
          [PR.PR_PUNCTUATION,   /^\.(?:CPU|PARAMCOUNT|TIME|VERSION)\b/i, null],
          [PR.PR_PUNCTUATION,   /^\.(?:A16|A8|ADDR|ALIGN|ASCIIZ|ASSERT|AUTOIMPORT|BANKBYTES|BSS|BYT|BYTE|CASE|CHARMAP|CODE|CONDES|CONSTRUCTOR|DATA|DBYT|DEBUGINFO|DEFINE|DELMAC|DELMACRO|DEF|DEFINED|DESTRUCTOR|DWORD|ELSE|ELSEIF|END|ENDENUM|ENDIF|ENDMAC|ENDMACRO|ENDPROC|ENDREP|ENDREPEAT|ENDSCOPE|ENDSTRUCT|ENDUNION|ENUM|ERROR|EXITMAC|EXITMACRO|EXPORT|EXPORTZP|FARADDR|FATAL|FEATURE|FILEOPT|FOPT|FORCEIMPORT|GLOBAL|GLOBALZP|HIBYTES|I16|I8|IF|IFBLANK|IFCONST|IFDEF|IFNBLANK|IFNDEF|IFNREF|IFP02|IFP816|IFPC02|IFPSC02|IFREF|IMPORT|IMPORTZP|INCBIN|INCLUDE|INTERRUPTOR|LINECONT|LIST|LISTBYTES|LOBYTES|LOCAL|LOCALCHAR|MACPACK|MAC|MACRO|ORG|OUT|P02|P816|PAGELEN|PAGELENGTH|PC02|POPCPU|POPSEG|PROC|PSC02|PUSHCPU|PUSHSEG|RELOC|REPEAT|RES|RODATA|SCOPE|SEGMENT|SET|SETCPU|SMART|STRUCT|TAG|UNDEF|UNDEFINE|UNION|WARNING|WORD|ZEROPAGE)\b/i, null],
          [PR.PR_PUNCTUATION,   /^\.(?:BANK|BANKBYTE|BLANK|CONCAT|CONST|HIBYTE|HIWORD|IDENT|LEFT|LOBYTE|LOWORD|MATCH|MAX|MID|MIN|REF|REFERENCED|RIGHT|SIZEOF|STRAT|SPRINTF|STRING|STRLEN|TCOUNT|XMATCH)\b/i, null],
          [PR.PR_PUNCTUATION,   /^#/, null],
          [PR.PR_TYPE,          /^(\*|:\++|:-+)/, null],
          [PR.PR_TYPE,          /^(@?[_a-z][_a-z0-9]*)?:/, null],
          [PR.PR_TYPE,          /@?[_a-z][_a-z0-9]*/, null]
          // [PR.PR_PUNCTUATION,   /^[-,:;!<>=\+^\/\*]+/]
        ]),
    ['asm6502']);
