import Papa from 'papaparse';

export const parseFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(results.errors)
        } else {
          resolve(results.data)
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}
