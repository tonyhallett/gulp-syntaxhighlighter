describe('a toggle test',()=>{
    it.each`
        header1 | header2
        ${"h1"} | ${"h2"}
    `('is a test of it each using header1 as part of test name $header1',(arg)=>{
        expect(arg.header1).toBe("h1")
    });
})