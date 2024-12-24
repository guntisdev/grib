import { contentType } from "jsr:@std/media-types";

export async function serveSPA(req: Request) {
    const urlObject = new URL(req.url)
    const path = urlObject.pathname

    const webPath = (await Deno.stat("./web/dist")
        .catch(() => null))?.isDirectory
        ? "./web/dist"
        : "../web/dist"
    
    if (await fileExists(webPath + path)) {
        return await serveFile(webPath + path)
    } else {
        return await serveFile(webPath + "/index.html")
    }
}

async function serveFile(filePath: string): Promise<Response> {
    const file = await Deno.open(filePath, { read: true });
    const splitted = filePath.split('.')
    const extension = splitted[splitted.length-1]
    console.log(">>", contentType(filePath), contentType("."+extension))
    const headers = new Headers({ "Content-Type": contentType("."+extension) || "application/octet-stream" });
    return new Response(file.readable, { headers });
}

async function fileExists(path: string): Promise<boolean> {
    try {
        const stat = await Deno.stat(path);
        return stat.isFile; // Returns true only if it's a file
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
        return false; // File does not exist
        }
        throw error; // Re-throw other errors
    }
}
