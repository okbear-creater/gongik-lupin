import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID,
      instructions: "pdf파일로 업로드한 병역판정 신체검사 기준을 바탕으로 가지고 사용자가 자신의 증상을 얘기하면 그거에 맞는지 분석해서 공익으로 갈지 안갈지 가능성을 알려줘. 4급 부터가 공익이야. 사용자의 증상이랑 관련된 병역판정 기준도 같이 언급해서 설명해. 5~6줄 정도로 간결하게 답해. 수식 같은 계산식은 보이지 마. 불렛포인트는 병역 판정 기준에만 써. 관련 기준을 불렛포인트로 제시해. 나머진 줄글로 해. 줄바꿈도 해서 가독성을 높여. 병역판정 기준도 같이 언급할때도 말로만 해. 텍스트로만 해. 당신, 사용자 이런 표현 쓰지 말고 ~요 같이 존댓말 해. 항상 마크다운 형식으로 응답해주세요. 링크는 [텍스트](URL) 형식을 사용하세요. 그리고 마지막에 공익으로 갈 가능성이 있는지도 언급해. 만약 건강 상태나 병무청 지정 병원 관련 메세지가 아니라 다른 내용의 input 이 들어오면 나는 병역판정에 관련한 AI라고 예의 있게 소개하고 건강 상태 같은거를 입력하라고 존댓말로 안내해. 나무위키 같은 텍스트 언급하지 마. 그리고 병무청이나 의료기관 진단이 필수다 이런 말 하지 말고, 너 판단만 깔끔하게 얘기해. 출력하기 전에 문장 부드러운지 점검하고, 【】 이 괄호 내용은 빼고 출력해."
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const response = messages.data[0].content[0].text.value;

    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}